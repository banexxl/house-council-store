import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { LoginPage } from "./sign-in";
import { Header } from "@/app/components/header";
import { logServerAction } from "@/app/lib/server-logging";

export default async function Page() {

     const user = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering sign in page',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0,
          type: 'internal',
     })

     return (
          <>
               <Header user={user ? user : null} />
               <LoginPage />
               <Footer />
          </>

     )
}
