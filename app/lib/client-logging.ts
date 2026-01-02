'use client'

import { supabaseBrowserClient } from "./sb-browser-client";
import { LogType } from "./server-logging";

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

     const { error: logInsertError } = await supabaseBrowserClient.from('tblClientLogs').insert({
          user_id,
          action,
          payload,
          status,
          error,
          duration_ms,
          type
     })

     if (logInsertError) console.error(logInsertError)
}