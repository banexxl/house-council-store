'use server';

import { useServerSideSupabaseServiceRoleClient } from "@/app/lib/ss-supabase-service-role-client";
import { revalidatePath } from "next/cache";
import { logServerAction } from "../lib/server-logging";
import { ActivityItem } from "./components/profile-sidebar";
import { useServerSideSupabaseAnonClient } from "../lib/ss-supabase-anon-client";
import { PolarCustomer } from "../types/polar-customer-types";
import { polar } from "../lib/polar";

export const logoutUserAction = async (): Promise<string | null> => {
     const startTime = Date.now();
     const supabase = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabase.auth.getUser()).data.user?.id;
     const { error } = await supabase.auth.signOut();
     if (error) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Logout User - Error during supabase logout.',
               payload: {},
               status: 'fail',
               error: '',
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return error.message;
     }
     await logServerAction({
          user_id: userId ? userId : '',
          action: 'Logged out successfully.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'auth'
     })
     return null;
}

export const deleteAccountAction = async (userId: string, clientEmail: string): Promise<{ success: boolean, error?: string }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data: customer, error: customerError } = await supabase.from('tblPolarCustomers').select('id').eq('externalId', userId).single();

     await logoutUserAction();

     const { data, error } = await supabase.auth.admin.deleteUser(userId);

     if (error) {
          await logServerAction({
               user_id: userId,
               action: 'Delete Account - Error for auth table of users.',
               payload: {},
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'auth'
          })
          return { success: false, error: error.message }
     }

     // Delete Polar customer via API
     let deleteCustomerResult
     try {
          deleteCustomerResult = await polar.customers.delete({
               id: customer?.id || ''
          });
     } catch (error: any) {
          await logServerAction({
               user_id: userId || '',
               action: 'Delete Account - Error deleting Polar customer via API.',
               payload: { email: clientEmail },
               status: 'fail',
               error: JSON.stringify(deleteCustomerResult) || error.message || 'Unknown error',
               duration_ms: Date.now() - startTime,
               type: 'api'
          })
          return { success: false, error: error.message || 'Failed to delete Polar customer' }
     }

     await logServerAction({
          user_id: userId,
          action: 'Delete Account - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'auth'
     })

     return { success: true }
}

export const readAccountByEmailAction = async (email: string): Promise<{ customer?: PolarCustomer, error?: string }> => {

     const startTime = Date.now();

     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabaseAdmin.auth.getUser()).data.user?.id;
     const supabase = await useServerSideSupabaseAnonClient();
     const { data: customer, error } = await supabase
          .from('tblPolarCustomers')
          .select('*')
          .eq('externalId', userId)
          .maybeSingle();

     if (error) {

          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Account - Error for tblPolarCustomers table.',
               payload: { email },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'db'
          })
          return { error: error.message }
     }

     if (!customer) {
          await logServerAction({
               user_id: userId ? userId : '',
               action: 'Read Account - Customer not found.',
               payload: { email },
               status: 'fail',
               error: 'No customer found with this email',
               duration_ms: Date.now() - startTime,
               type: 'db'
          })
          return { error: 'No customer found with this email' }
     }

     await logServerAction({
          user_id: customer?.id,
          action: 'Read Account - Success.',
          payload: { email },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'db'
     })

     return { customer }
}

export const updateAccountAction = async (id: string, update: Partial<PolarCustomer>): Promise<{ success: boolean, error?: string, data?: PolarCustomer }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseAnonClient();

     const { data, error } = await supabase
          .from('tblPolarCustomers')
          .update(update)
          .eq('id', id)
          .single();

     if (error) {

          await logServerAction({
               user_id: id,
               action: 'Update Account - Error for tblPolarCustomers table.',
               payload: { update },
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'action'
          })
          return { success: false, error: error.message }
     }

     await logServerAction({
          user_id: id,
          action: 'Update Account - Success.',
          payload: { update },
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'action'
     })

     revalidatePath('/profile');

     return { success: true, data }
}

export const readClientRecentActivityAction = async (clientEmail: string, clientAuthId: string): Promise<{ success: boolean, error?: string, data?: ActivityItem[] }> => {

     const startTime = Date.now();

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data: authUser, error: authUserError } = await supabase.auth.admin.listUsers();

     const userObject = authUser?.users.find((user: any) => user.email === clientEmail);


     const userIds = [userObject?.id, clientAuthId].filter(Boolean);
     const logTypes = ['auth'];

     const { data, error } = await supabase
          .from('tblServerLogs')
          .select('*')
          .in('user_id', userIds)
          .in('type', logTypes)
          .order('created_at', { ascending: false })
          .limit(5);

     if (error) {
          await logServerAction({
               user_id: clientAuthId,
               action: 'Read Client Recent Activity - Error for tblActivityLogs table.',
               payload: {},
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'db'
          })
          return { success: false, error: error.message }
     }
     await logServerAction({
          user_id: clientAuthId,
          action: 'Read Client Recent Activity - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'db'
     })

     return { success: true, data }
}

export const readAllApartmentsByClientId = async (clientId: string): Promise<{ success: boolean, error?: string, data?: any[] }> => {

     const startTime = Date.now();
     const supabase = await useServerSideSupabaseAnonClient();
     // First, get all buildings for the client
     const { data: buildings, error: buildingsError } = await supabase
          .from('tblBuildings')
          .select('id')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

     if (buildingsError) {
          return { success: false, error: buildingsError.message };
     }

     const buildingIds = (buildings ?? []).map(b => b.id);

     // If no buildings, return empty array
     if (buildingIds.length === 0) {
          return { success: true, data: [] };
     }

     // Get all apartments with building_id in buildingIds
     const { data, error } = await supabase
          .from('tblApartments')
          .select('*')
          .in('building_id', buildingIds)
          .order('created_at', { ascending: false });

     if (error) {
          await logServerAction({
               user_id: clientId,
               action: 'Read All Apartments By Client Id - Error for tblApartments table.',
               payload: {},
               status: 'fail',
               error: error.message,
               duration_ms: Date.now() - startTime,
               type: 'db'
          })
          return { success: false, error: error.message }
     }
     await logServerAction({
          user_id: clientId,
          action: 'Read All Apartments By Client Id - Success.',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: Date.now() - startTime,
          type: 'db'
     })
     return { success: true, data }
}