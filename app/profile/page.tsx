import { getSession } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfilePage } from "./profile";
import { readAccountByIdAction } from "./account-action";



export default async function Page() {

     const session = await getSession();
     const { success, error } = await readAccountByIdAction(session ? session.user.id : '');


     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <ProfilePage />
               <Footer />
          </>

     )
}
