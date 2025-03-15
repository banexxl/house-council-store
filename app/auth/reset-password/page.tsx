import { getSession } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ResetPasswordPage } from "./reset-password";
export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <ResetPasswordPage />
               <Footer />
          </>

     )
}
