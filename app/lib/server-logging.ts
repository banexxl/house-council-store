import { useServerSideSupabaseServiceRoleClient } from "./ss-supabase-service-role-client";

export type ServerLog = {
     id?: string;
     user_id: string | null;
     action: string;
     payload: any;
     status: 'success' | 'fail';
     error: string;
     duration_ms: number;
}

export const logServerAction = async ({
     user_id,
     action,
     payload,
     status,
     error,
     duration_ms,
}: ServerLog) => {

     const supabase = await useServerSideSupabaseServiceRoleClient();
     console.log('Server logging action started!');
     const { error: logInsertError } = await supabase.from('tblServerLogs').insert({
          user_id,
          action,
          payload,
          status,
          error,
          duration_ms,
     })
     console.log('Error from logServerAction', logInsertError);

}
