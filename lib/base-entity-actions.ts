'use server'

import { useServerSideSupabaseServiceRoleClient } from "./ss-supabase-service-role-client";

export interface BaseEntity {
     id?: string;
     created_at?: string;
     updated_at?: string;
     name: string;
     description?: string;
}

export const readEntity = async <T extends BaseEntity>(table: string, id: string): Promise<{ success: boolean, entity?: T, error?: string }> => {

     console.log('table', table);
     console.log('id', id);

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
     console.log('data', data);
     console.log('error', error);

     if (error) {
          return { success: false, error: error.message };
     }

     return { success: true, entity: data };
};

export const readAllEntities = async <T extends BaseEntity>(table: string): Promise<T[]> => {

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { data, error } = await supabase.from(table).select('*').order('updated_at', { ascending: false });

     if (error) {
          console.error(`Error fetching entities from ${table}:`, error);
          return [];
     }

     return data;
};
