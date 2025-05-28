import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { LoginPage } from "./sign-in";
import { Header } from "@/app/components/header";

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
