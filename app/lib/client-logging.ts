'use client'

import { LogType } from "./server-logging";
import { createSupabaseBrowserClient } from "./supabase-client";

export type ClientLog = {
     id?: string;
     user_id: string | null;
     action: string;
     payload: any;
     status: 'success' | 'fail';
     error: string;
     duration_ms: number;
     type: LogType;
}

export const logClientAction = async ({
     user_id,
     action,
     payload,
     status,
     error,
     duration_ms,
     type
}: ClientLog) => {

     const supabase = await createSupabaseBrowserClient();

     const { error: logInsertError } = await supabase.from('tblServerLogs').insert({
          user_id,
          action,
          payload,
          status,
          error,
          duration_ms,
          type
     })
     console.log(`Client log action: ${action}: ${status}`)
     console.log('Client log error:', error);


     if (logInsertError) console.error(logInsertError)
}