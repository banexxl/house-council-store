"use server"

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client"
import { redirect } from "next/navigation"

export async function sendPasswordResetEmail(email: string): Promise<void> {

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
          .select("email")
          .eq("email", email)
          .single()
     console.log("userExists", userExists);
     console.log("userCheckError", userCheckError);

     if (userCheckError || !userExists) {
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=false&message=${encodeURIComponent(
                    "No account found with the provided email address."
               )}`
          )
     }

     const { data, error } = await supabase.auth.resetPasswordForEmail(userExists.email)

     if (data) {
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=true&message=${encodeURIComponent(
                    "Password reset instructions have been sent to your email."
               )}`
          )
     } else {
          redirect(
               `${process.env.BASE_URL}/auth/forgot-password/result?success=false&message=${encodeURIComponent(
                    "Failed to send password reset email. Please try again later."
               )}`
          )
     }
}
