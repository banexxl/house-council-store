import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ResetPasswordPage } from "./reset-password";
export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <ResetPasswordPage />
               <Footer />
          </>

     )
}
