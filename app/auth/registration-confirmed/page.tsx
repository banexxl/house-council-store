import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
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
