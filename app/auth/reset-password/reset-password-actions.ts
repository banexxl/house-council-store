"use server"

import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";

export async function resetPasswordWithOldPassword(email: string, oldPassword: string, newPassword: string): Promise<{ success: boolean, error?: string }> {

     const startTime = Date.now();

     let userId = null;

     const supabase = await useServerSideSupabaseAnonClient();

     const { data: user, error: userError } = await supabase
          .from('tblPolarCustomers')
          .select('*')
          .eq('email', email)
          .single();

     userId = user?.id || null;

     if (userError || !user) {
          await logServerAction({
               user_id: null,
               action: 'Reset password - user not found',
               payload: { email },
               status: 'fail',
               error: userError?.message || 'User not found',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          });

          return {
               success: false,
               error: userError?.message || "User not found with the provided email address.",
          }
     }

     if (!email || !email.includes("@") || !newPassword || !oldPassword) {

          await logServerAction({
               user_id: null,
               action: 'Reset password - invalid input',
               payload: {},
               status: 'fail',
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })

          return {
               success: false,
               error: "Please enter a valid email address and old and new passwords.",
          }
     }

     try {
          // Get the current session
          const { data: { session }, error: sessionError, } = await supabase.auth.getSession()

          if (sessionError || !session) {
               return {
                    success: false,
                    error: sessionError?.message || "No active session found",
               }
          }

          // Check if the old password is correct
          const { data: signedInUser, error: signInError } = await supabase.auth.signInWithPassword({ email: email, password: oldPassword })

          if (signInError) {
               logServerAction({
                    user_id: null,
                    action: 'Reset password - old password incorrect',
                    payload: { email },
                    status: 'fail',
                    error: signInError.message,
                    duration_ms: Date.now() - startTime,
                    type: 'auth'
               })
               return {
                    success: false,
                    error: signInError?.message || "Failed to reset password",
               }
          }

          // Update the user's password
          const { error } = await supabase.auth.updateUser({ password: newPassword })

          if (error) {
               logServerAction({
                    user_id: null,
                    action: 'Reset password - password update failed',
                    payload: { email },
                    status: 'fail',
                    error: error.message,
                    duration_ms: Date.now() - startTime,
                    type: 'auth'
               })
               return {
                    success: false,
                    error: error?.message || "Failed to reset password",
               }
          }

          logServerAction({
               user_id: userId,
               action: 'Reset password - success',
               payload: { email },
               status: 'success',
               error: '',
               duration_ms: 0,
               type: 'action'
          })

          return {
               success: true,
          }
     } catch (error: any) {
          logServerAction({
               user_id: null,
               action: 'Reset password - error',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return {
               success: false,
               error: error?.message || "Failed to reset password",
          }
     }
}

export async function resetPassword(email: string, newPassword: string): Promise<{ success: boolean, error?: string }> {

     const startTime = Date.now();

     let userId = null;

     const supabase = await useServerSideSupabaseAnonClient();

     const { data: user, error: userError } = await supabase
          .from('tblPolarCustomers')
          .select('*')
          .eq('email', email)
          .single();

     userId = user?.id || null;

     if (userError || !user) {
          await logServerAction({
               user_id: null,
               action: 'Reset password - user not found',
               payload: { email },
               status: 'fail',
               error: userError?.message || 'User not found',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          });

          return {
               success: false,
               error: userError?.message || "User not found with the provided email address.",
          }
     }

     if (!email || !email.includes("@") || !newPassword) {

          await logServerAction({
               user_id: null,
               action: 'Reset password - invalid input',
               payload: {},
               status: 'fail',
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })

          return {
               success: false,
               error: "Please enter a valid email address and new password.",
          }
     }

     try {
          // Update the user's password
          const { error } = await supabase.auth.updateUser({ password: newPassword })

          if (error) {
               logServerAction({
                    user_id: null,
                    action: 'Reset password - password update failed',
                    payload: { email },
                    status: 'fail',
                    error: error.message,
                    duration_ms: Date.now() - startTime,
                    type: 'auth'
               })
               return {
                    success: false,
                    error: error?.message || "Failed to reset password",
               }
          }

          logServerAction({
               user_id: userId,
               action: 'Reset password - success',
               payload: { email },
               status: 'success',
               error: '',
               duration_ms: 0,
               type: 'action'
          })

          return {
               success: true,
          }
     } catch (error: any) {
          logServerAction({
               user_id: null,
               action: 'Reset password - error',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return {
               success: false,
               error: error?.message || "Failed to reset password",
          }
     }
}

export const verifyRecoveryToken = async (email: string, token: string): Promise<{ success: boolean, data?: any, error?: string }> => {

     const startTime = Date.now();

     if (!email || !email.includes("@")) {
          await logServerAction({
               user_id: null,
               action: 'Verify recovery token - invalid input',
               payload: {},
               status: 'fail',
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return {
               success: false,
               error: "Please enter a valid email address.",
          }
     }

     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase.auth.verifyOtp({
          email: email, // The email received from the URL
          token: token, // The token_hash received from the URL
          type: 'recovery' // Specify that this is for password recovery
     });

     if (error) {
          await logServerAction({
               user_id: null,
               action: 'Verify recovery token - error',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return {
               success: false,
               error: error?.message || "Invalid token",
          }
     } else {
          await logServerAction({
               user_id: null,
               action: 'Verify recovery token - success',
               payload: { email },
               status: 'success',
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return {
               success: true,
               data,
          }
     }
}
