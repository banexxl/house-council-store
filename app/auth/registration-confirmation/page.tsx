import { getSession } from "@/lib/get-session";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { RegistrationConfirmationPage } from "./registration-confirmation";

export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <RegistrationConfirmationPage />
               <Footer />
          </>

     )
}
