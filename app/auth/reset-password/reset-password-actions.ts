"use server"

import { logServerAction } from "@/app/lib/server-logging";
import { useServerSideSupabaseAnonClient } from "@/app/lib/ss-supabase-anon-client";

export async function resetPassword(email: string, newPassword: string): Promise<{ success: boolean, error?: string }> {

     let userId = null;

     const supabase = await useServerSideSupabaseAnonClient();

     const { data: user, error: userError } = await supabase
          .from('tblClients')
          .select('*')
          .eq('email', email)
          .single();
     console.log('user', user);
     console.log('userError', userError);

     userId = user?.id || null;

     if (userError || !user) {
          await logServerAction({
               user_id: null,
               action: 'Reset password - user not found',
               payload: { email },
               status: 'fail',
               error: userError?.message || 'User not found',
               duration_ms: 0
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
               duration_ms: 0
          })

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


          if (error) {
               logServerAction({
                    user_id: null,
                    action: 'Reset password - password update failed',
                    payload: { email },
                    status: 'fail',
                    error: error.message,
                    duration_ms: 0
               })
               throw error
          }

          logServerAction({
               user_id: userId,
               action: 'Reset password - success',
               payload: { email },
               status: 'success',
               error: '',
               duration_ms: 0
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
               duration_ms: 0
          })
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
