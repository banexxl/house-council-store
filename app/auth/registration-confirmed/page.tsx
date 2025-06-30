import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmedPage } from "./registration-confirmed";
import { activateAccount } from "./registration-confirmed-action";
import { redirect } from "next/navigation";

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
