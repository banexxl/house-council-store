import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ForgotPasswordPage } from "./forgot-password";

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <ForgotPasswordPage />
               <Footer />
          </>

     )
}
