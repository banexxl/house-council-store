import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { LoginPage } from "./sign-in";
import { Header } from "@/components/header";

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <LoginPage />
               <Footer />
          </>

     )
}
