import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { RegistrationConfirmedPage } from "./registration-confirmed";
import { activateAccount } from "./registration-confirmed-action";
import { redirect } from "next/navigation";

export default async function Page() {

     const user = await getSessionUser();

     const { success, error } = await activateAccount(user?.email!);
     if (!success) {
          // Redirect to login if not authenticated
          return redirect(
               `${process.env.NEXT_PUBLIC_BASE_URL}/auth/error?error=email_not_verified`
          );
     }

     return (
          <>
               <Header user={user ? user : null} />
               <RegistrationConfirmedPage />
               <Footer />
          </>

     )
}
