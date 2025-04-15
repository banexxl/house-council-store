"use server"

import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";

export async function resetPassword(newPassword: string) {

     const supabase = await useServerSideSupabaseAnonClient();

     try {
          // Get the current session
          const {
               data: { session },
               error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError || !session) {
               return {
                    success: false,
                    error: sessionError?.message || "No active session found",
               }
          }

          // Update the user's password
          const { error } = await supabase.auth.admin.updateUserById(session.user.id, { password: newPassword })

          if (error) {
               throw error
          }

          return {
               success: true,
          }
     } catch (error: any) {
          console.error("Error resetting password:", error)
          return {
               success: false,
               error: error?.message || "Failed to reset password",
          }
     }
}
export const verifyRecoveryToken = async (email: string, token: string): Promise<{ success: boolean, data?: any, error?: string }> => {

     if (!email || !email.includes("@")) {
          return {
               success: false,
               error: "Please enter a valid email address.",
          }
     }

     const supabase = await useServerSideSupabaseAnonClient();
     console.log('email', email);
     console.log('token', token);

     const { data, error } = await supabase.auth.verifyOtp({
          email: email, // The email received from the URL
          token: token, // The token_hash received from the URL
          type: 'recovery' // Specify that this is for password recovery
     });
     console.log('Verify OTP:', data);
     console.log('Error:', error);

     if (error) {
          console.error('Invalid token:', error.message);
          return {
               success: false,
               error: error?.message || "Invalid token",
          }
     } else {
          console.log('Token is valid:', data);
          return {
               success: true,
               data,
          }
     }
}
