'use server'

import { polar } from "@/app/lib/polar"; // adjust
import { logServerAction } from "@/app/lib/server-logging"; // adjust
import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";

export type RegisterErrorType = { code: string; details: string; hint: string | null; message: string };

export type RegisterFormValues = {
     email: string;
     confirm_email: string;
     password: string;
     confirm_password: string;
     contact_person: string;
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
               payload: { email: values.email },
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

     let userId: string | null = null;

     try {
          // 1) Create auth user
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
                    payload: { email: values.email },
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
          if (!userId) throw new Error("SIGNUP_FAILED_NO_USER_ID");

          // 2) Create Polar customer
          // ✅ externalId lets the webhook map back to your Supabase userId
          await polar.customers.create({
               email: values.email,
               name: values.contact_person,
               externalId: userId,
               metadata: { userId }, // optional safety
          });

          await logServerAction({
               user_id: userId,
               action: "Register user - auth + Polar customer created (DB row via webhook)",
               payload: { email: values.email, name: values.contact_person },
               status: "success",
               error: "",
               duration_ms: Date.now() - t0,
               type: "auth",
          });

          return { success: true };
     } catch (e: any) {
          // Rollback auth user if Polar create fails (or any error after signup)
          try {
               if (userId) await supabaseAdmin.auth.admin.deleteUser(userId);
          } catch { }

          await logServerAction({
               user_id: userId,
               action: "Register user - failed (rolled back auth user)",
               payload: { email: values.email },
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
