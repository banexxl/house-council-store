"use server"

import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";

export async function resetPassword(email: string, newPassword: string): Promise<{ success: boolean, error?: string }> {
     console.log('newPassword', newPassword);
     console.log('email', email);

     const supabase = await useServerSideSupabaseAnonClient();

     if (!email || !email.includes("@") || !newPassword) {
          return {
               success: false,
               error: "Please enter a valid email address and password.",
          }
     }

     try {
          // Get the current session
          // const { data: { session }, error: sessionError, } = await supabase.auth.getSession()
          // console.log('session', session);
          // console.log('sessionError', sessionError);

          // if (sessionError || !session) {
          //      return {
          //           success: false,
          //           error: sessionError?.message || "No active session found",
          //      }
          // }

          // Update the user's password
          const { error } = await supabase.auth.updateUser({ password: newPassword })
          console.log('error', error);

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
          return {
               success: false,
               error: error?.message || "Invalid token",
          }
     } else {
          return {
               success: true,
               data,
          }
     }
}
