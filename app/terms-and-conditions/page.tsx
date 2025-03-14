import { getSession } from "@/lib/get-session";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { TermsPage } from "./terms";


export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <TermsPage />
               <Footer />
          </>

     )
}
