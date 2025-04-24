'use server'

import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ResetPasswordPage } from "./reset-password";
import { logServerAction } from "@/app/lib/server-logging";

export default async function Page() {

     const user = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering reset password page with users SESSION id',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     return (
          <>
               <Header user={user || null} />
               <ResetPasswordPage />
               <Footer />
          </>
     );
}
