'use server';

import { polar } from "@/app/lib/polar"; // adjust if needed
import { logServerAction } from "@/app/lib/server-logging"; // adjust if needed
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";
import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";

export type RegisterErrorType = { code: string; details: string; hint: string | null; message: string };

export type RegisterFormValues = {
     contact_person: string;
     email: string;
     confirm_email: string
     password: string;
     confirm_password: string;
};

export const registerUser = async (
     values: RegisterFormValues
): Promise<{ success: boolean; error?: RegisterErrorType }> => {
     const t0 = Date.now();

     if (!values.email || !values.confirm_email || !values.password || !values.confirm_password || !values.contact_person) {
          return {
               success: false,
               error: { code: "VALIDATION_ERROR", details: "All fields are required", hint: null, message: "All fields are required" },
          };
     }

     if (values.password !== values.confirm_password) {
          await logServerAction({
               user_id: null,
               action: "Register user - passwords do not match",
               payload: { values: { ...values, password: "***", confirm_password: "***" } },
               status: "fail",
               error: "Passwords do not match",
               duration_ms: Date.now() - t0,
               type: "auth",
          });

          return {
               success: false,
               error: { code: "PASSWORDS_DO_NOT_MATCH", details: "Passwords do not match", hint: null, message: "Passwords do not match" },
          };
     }

     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
     const supabase = await useServerSideSupabaseAnonClient();

     let userId: string | null = null;
     let polarCustomerId: string | null = null;

     try {
          // 1) Create auth user (service role)
          const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
               email: values.email,
               password: values.password,
               options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/registration-confirmation`,
               },
          });

          if (signUpError) {
               await logServerAction({
                    user_id: null,
                    action: "Register user - sign up error",
                    payload: { values: { ...values, password: "***", confirm_password: "***" } },
                    status: "fail",
                    error: signUpError.message,
                    duration_ms: Date.now() - t0,
                    type: "auth",
               });

               if ((signUpError as any).code === "23505") {
                    return {
                         success: false,
                         error: { code: "23505", details: "Email already exists", hint: null, message: "Email already exists" },
                    };
               }

               return {
                    success: false,
                    error: {
                         code: (signUpError as any).code ? String((signUpError as any).code) : "UNKNOWN",
                         details: signUpError.message || "Unknown error",
                         hint: null,
                         message: signUpError.message || "Unknown error",
                    },
               };
          }

          userId = signUpData?.user?.id ?? null;
          if (!userId) {
               throw new Error("SIGNUP_FAILED_NO_USER_ID");
          }

          // 2) Upsert local row (no customerId yet)
          const { data: localRow, error: localErr } = await supabase
               .from("tblPolarCustomers")
               .upsert(
                    {
                         name: values.contact_person,
                         email: values.email,
                         userId,
                    },
                    { onConflict: "userId" }
               )
               .select("id,userId,email,name")
               .single();

          if (localErr) {
               await logServerAction({
                    user_id: userId,
                    action: "Register user - local customer upsert failed",
                    payload: { values: { ...values, password: "***", confirm_password: "***" }, error: localErr },
                    status: "fail",
                    error: localErr.message,
                    duration_ms: Date.now() - t0,
                    type: "auth",
               });

               // Rollback auth user if local insert fails
               await supabaseAdmin.auth.admin.deleteUser(userId);
               return {
                    success: false,
                    error: { code: localErr.code || "DB_ERROR", details: localErr.details || "", hint: localErr.hint, message: localErr.message },
               };
          }

          // 3) Create Polar customer (link to supabase user via externalId)
          const polarCustomer = await polar.customers.create({
               email: values.email,
               name: values.contact_person,
               externalId: userId, // ✅ critical
               metadata: { userId }, // ✅ optional but helpful
          });

          polarCustomerId = polarCustomer.id;

          // 4) Store Polar id in your table
          const { error: linkErr } = await supabase
               .from("tblPolarCustomers")
               .update({
                    customerId: polarCustomer.id,
                    organizationId: polarCustomer.organizationId ?? null,
                    avatarUrl: polarCustomer.avatarUrl ?? null,
                    emailVerified: polarCustomer.emailVerified ?? false,
                    billingAddress: polarCustomer.billingAddress ?? null,
                    taxId: polarCustomer.taxId ?? [],
                    metadata: polarCustomer.metadata ?? {},
                    deletedAt: polarCustomer.deletedAt ?? null,
                    createdAt: polarCustomer.createdAt ?? null,
                    modifiedAt: polarCustomer.modifiedAt ?? null,
               })
               .eq("userId", userId);

          if (linkErr) {
               // Rollback Polar + auth user + local row (best effort)
               try {
                    if (polarCustomerId) await polar.customers.delete({ id: polarCustomerId });
               } catch { }

               try {
                    await supabase.from("tblPolarCustomers").delete().eq("userId", userId);
               } catch { }

               try {
                    await supabaseAdmin.auth.admin.deleteUser(userId);
               } catch { }

               throw linkErr;
          }

          // 5) Success log
          await logServerAction({
               user_id: userId,
               action: "Register user - sign up & Polar customer success",
               payload: { email: values.email, contact_person: values.contact_person, polarCustomerId },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "auth",
          });

          return { success: true };
     } catch (e: any) {
          // Best-effort rollback
          try {
               if (polarCustomerId) await polar.customers.delete({ id: polarCustomerId });
          } catch { }

          try {
               if (userId) await supabase.from("tblPolarCustomers").delete().eq("userId", userId);
          } catch { }

          try {
               if (userId) await supabaseAdmin.auth.admin.deleteUser(userId);
          } catch { }

          await logServerAction({
               user_id: userId,
               action: "Register user - unexpected failure",
               payload: { email: values.email, contact_person: values.contact_person, polarCustomerId },
               status: "fail",
               error: e?.message || String(e),
               duration_ms: Date.now() - t0,
               type: "auth",
          });

          return {
               success: false,
               error: {
                    code: "REGISTER_FAILED",
                    details: "Registration failed",
                    hint: null,
                    message: e?.message || "Registration failed",
               },
          };
     }
};
