'use server';

import { revalidatePath } from 'next/cache';
import { useServerSideSupabaseServiceRoleClient } from './ss-supabase-service-role-client';
import { logServerAction } from './server-logging';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const bucket = process.env.SUPABASE_S3_CLIENT_IMAGES_BUCKET!;

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
export async function uploadClientAvatarAction(formData: FormData): Promise<{ success: boolean; message: string; awsUrl?: string }> {
     const file = formData.get('file') as string;
     const title = formData.get('title') as string;
     const extension = formData.get('extension') as string;
     const fileName = formData.get('fileName') as string;
     const folderName = formData.get('folderName') as string;

     if (!file || !title || !extension || !fileName || !folderName) {
          throw new Error('Missing file, title, or extension');
     }

     const base64PrefixRegex = /^data:image\/[a-zA-Z]+;base64,/;
     const base64Data = file.replace(base64PrefixRegex, '');
     const buffer = Buffer.from(base64Data, 'base64');

     if (buffer.length > MAX_FILE_SIZE) {
          return { success: false, message: 'File size limit exceeded' };
     }

     const supabase = await useServerSideSupabaseServiceRoleClient();
     const key = `Clients/${folderName}/Images/Logos/${fileName.split('.')[0]}.${extension}`;

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
               payload: { title, folderName, key },
               status: 'fail',
               type: 'db',
               user_id: '',
          });

          return { success: false, message: 'Failed to upload file: ' + uploadError.message };
     }

     const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(key);
     const awsUrl = publicUrlData?.publicUrl;

     await logServerAction({
          action: 'Upload Client Avatar - Success',
          duration_ms: 0,
          error: '',
          payload: { awsUrl, key },
          status: 'success',
          type: 'db',
          user_id: '',
     });

     revalidatePath(`/profile`);

     return {
          success: true,
          message: 'File uploaded successfully',
          awsUrl,
     };
}

/**
 * Deletes a client avatar from Supabase Storage
 */
export async function deleteClientAvatarAction(formData: FormData): Promise<{ success: boolean; message: string }> {
     const awsUrl = formData.get('awsUrl') as string;
     if (!awsUrl) {
          throw new Error('Missing awsUrl');
     }

     const key = extractStorageKeyFromUrl(awsUrl);

     const supabase = await useServerSideSupabaseServiceRoleClient();

     const { error: deleteError } = await supabase.storage.from(bucket).remove([key]);

     if (deleteError) {
          await logServerAction({
               action: 'Delete Client Avatar - Failed',
               duration_ms: 0,
               error: deleteError.message,
               payload: { awsUrl, key },
               status: 'fail',
               type: 'db',
               user_id: '',
          });

          throw new Error('Failed to delete image from Supabase');
     }

     const { error: updateError } = await supabase.from('tblClients').update({ avatar: '' }).eq('avatar', awsUrl);

     if (updateError) {
          await logServerAction({
               action: 'Delete Client Avatar - Failed',
               duration_ms: 0,
               error: updateError.message,
               payload: { awsUrl, key },
               status: 'fail',
               type: 'db',
               user_id: '',
          });

          return { success: false, message: 'Failed to delete image from Supabase' };
     } else {

          await logServerAction({
               action: 'Delete Client Avatar - Success',
               duration_ms: 0,
               error: '',
               payload: { key },
               status: 'success',
               type: 'db',
               user_id: '',
          });

          revalidatePath('/profile');

          return { success: true, message: 'Image deleted successfully' };
     }
}