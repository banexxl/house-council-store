import { getSession } from "@/lib/get-session";

import Footer from "@/components/footer";
import { LoginPage } from "./sign-in";
import Header from "@/components/header";

export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <LoginPage />
               <Footer />
          </>

     )
}
