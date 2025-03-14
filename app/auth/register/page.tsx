import { getSession } from "@/lib/get-session";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { RegisterPage } from "./register-page";

export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <RegisterPage />
               <Footer />
          </>

     )
}
