import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RegistrationConfirmedPage } from "./registration-confirmed";

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <RegistrationConfirmedPage />
               <Footer />
          </>

     )
}
