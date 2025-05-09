"use server"

import { logServerAction } from "@/app/lib/server-logging"
import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client"
import { redirect } from "next/navigation"

export async function sendPasswordResetEmail(email: string): Promise<void> {

     const startTime = Date.now()

     const supabase = await useServerSideSupabaseServiceRoleClient()

     if (!email || !email.includes("@")) {
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=false&message=${encodeURIComponent(
                    "Please enter a valid email address."
               )}`
          )
     }

     const { data: userExists, error: userCheckError } = await supabase
          .from("tblClients")
          .select("email, id")
          .eq("email", email)
          .single()

     if (userExists) {
          await logServerAction({
               user_id: userExists?.id || null,
               action: "Send password request - User found",
               payload: { email },
               status: userCheckError ? "fail" : "success",
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
     }


     if (userCheckError || !userExists) {
          await logServerAction({
               user_id: null,
               action: "Send password request - User not found",
               payload: { email },
               status: "fail",
               error: userCheckError ? userCheckError.message : "Send password request - User not found",
               duration_ms: Date.now() - startTime, // Placeholder for duration, you can calculate it if needed
               type: 'auth'
          })
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=false&message=${encodeURIComponent(
                    "No account found with the provided email address."
               )}`
          )
     }
     const { data, error } = await supabase.auth.resetPasswordForEmail(userExists.email)
     if (data) {
          await logServerAction({
               user_id: userExists.id,
               action: "Send password request - Email sent",
               payload: { email },
               status: "success",
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=true&message=${encodeURIComponent(
                    "Password reset instructions have been sent to your email."
               )}`
          )
     } else {
          await logServerAction({
               user_id: userExists.id,
               action: "Send password request - Email sending failed",
               payload: { email },
               status: "fail",
               error: error ? error.message : "Failed to send password reset email.",
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=false&message=${encodeURIComponent(
                    "Failed to send password reset email. Please try again later."
               )}`
          )
     }
}
