import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import ForgotPasswordPage from "./forgot-password";

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
