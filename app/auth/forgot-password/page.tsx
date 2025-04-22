import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import ForgotPasswordPage from "./forgot-password";
import { logServerAction } from "@/app/lib/server-logging";

export default async function Page() {

     const user = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering forgot password page with users SESSION id',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0
     })

     return (
          <>
               <Header user={user ? user : null} />
               <ForgotPasswordPage />
               <Footer />
          </>

     )
}
