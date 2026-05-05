'use server';

import { revalidatePath } from 'next/cache';
import { useServerSideSupabaseServiceRoleClient } from './ss-supabase-service-role-client';
import { logServerAction } from './server-logging';
import { useServerSideSupabaseAnonClient } from './ss-supabase-anon-client';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const bucket = process.env.AWS_S3_BUCKET_NAME!;

/**
 * Extracts the storage key from a Supabase public URL
 */
function extractStorageKeyFromUrl(url: string): string {
     const parts = url.split('/storage/v1/object/public/');
     return parts[1] || '';
}

/**
 * Uploads a client avatar to Supabase Storage and returns the public URL
 */
export async function uploadClientAvatarAction(
     formData: FormData
): Promise<{ success: boolean; message: string; path?: string }> {
     const file = formData.get('file') as string;
     const extension = formData.get('extension') as string;
     const fileName = formData.get('fileName') as string;
     const folderName = formData.get('folderName') as string;

     if (!file || !extension || !fileName || !folderName) {
          throw new Error('Missing required fields');
     }

     const base64PrefixRegex = /^data:image\/[a-zA-Z]+;base64,/;
     const base64Data = file.replace(base64PrefixRegex, '');
     const buffer = Buffer.from(base64Data, 'base64');

     if (buffer.length > MAX_FILE_SIZE) {
          return { success: false, message: 'File size limit exceeded' };
     }

     const supabase = await useServerSideSupabaseAnonClient();

     const key = `clients/${folderName}/images/logos/${fileName.split('.')[0]}.${extension}`;

     const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(key, buffer, {
               contentType: `image/${extension}`,
               upsert: true,
          });

     if (uploadError) {
          await logServerAction({
               action: 'Upload Client Avatar - Failed',
               duration_ms: 0,
               error: uploadError.message,
               payload: { folderName, key },
               status: 'fail',
               type: 'db',
               user_id: '',
          });

          return {
               success: false,
               message: 'Failed to upload file: ' + uploadError.message,
          };
     }

     // ✅ IMPORTANT: store ONLY this
     const avatarPath = key;

     await logServerAction({
          action: 'Upload Client Avatar - Success',
          duration_ms: 0,
          error: '',
          payload: { avatarPath },
          status: 'success',
          type: 'db',
          user_id: '',
     });

     revalidatePath(`/profile`);

     return {
          success: true,
          message: 'File uploaded successfully',
          path: avatarPath,
     };
}

/**
 * Deletes a client avatar from Supabase Storage
 */export async function deleteClientAvatarAction(): Promise<{
     success: boolean;
     message: string;
}> {
     const supabaseAdmin = await useServerSideSupabaseServiceRoleClient();
     const userId = (await supabaseAdmin.auth.getUser()).data.user?.id;

     if (!userId) {
          throw new Error('Unauthorized');
     }

     const folderPath = `clients/${userId}/images/logos`;

     const supabase = supabaseAdmin;

     // ✅ 1. List all files in folder
     const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list(folderPath);

     if (listError) {
          await logServerAction({
               action: 'Delete Client Avatar - List Failed',
               duration_ms: 0,
               error: listError.message,
               payload: { folderPath },
               status: 'fail',
               type: 'db',
               user_id: userId,
          });

          return { success: false, message: 'Failed to list files' };
     }

     // ✅ 2. Build full paths
     const filePaths =
          files?.map((file) => `${folderPath}/${file.name}`) || [];

     // If nothing exists, just clean DB
     if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
               .from(bucket)
               .remove(filePaths);

          if (deleteError) {
               await logServerAction({
                    action: 'Delete Client Avatar - Delete Failed',
                    duration_ms: 0,
                    error: deleteError.message,
                    payload: { filePaths },
                    status: 'fail',
                    type: 'db',
                    user_id: userId,
               });

               return { success: false, message: 'Failed to delete images' };
          }
     }

     // ✅ 3. Clear DB field
     const { error: updateError } = await supabase
          .from('tblPolarCustomers')
          .update({ avatarUrl: '' })
          .eq('externalId', userId);

     if (updateError) {
          await logServerAction({
               action: 'Delete Client Avatar - DB Update Failed',
               duration_ms: 0,
               error: updateError.message,
               payload: { userId },
               status: 'fail',
               type: 'db',
               user_id: userId,
          });

          return { success: false, message: 'Failed to update database' };
     }

     await logServerAction({
          action: 'Delete Client Avatar - Success',
          duration_ms: 0,
          error: '',
          payload: { folderPath },
          status: 'success',
          type: 'db',
          user_id: userId,
     });

     revalidatePath('/profile');

     return { success: true, message: 'Avatar(s) deleted successfully' };
}