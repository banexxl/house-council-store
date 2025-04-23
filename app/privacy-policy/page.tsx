import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { PrivacyPage } from "./privacy";
import { logServerAction } from "../lib/server-logging";


export default async function Page() {

     const user = await getSessionUser();

     await logServerAction({
          user_id: user ? user.id : null,
          action: 'Rendering Privacy Page',
          payload: {},
          status: 'success',
          error: '',
          duration_ms: 0
     })

     return (
          <>
               <Header user={user ? user : null} />
               <PrivacyPage />
               <Footer />
          </>

     )
}
