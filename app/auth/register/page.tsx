import Header from "@/components/header";
import Footer from "@/components/footer";
import { getSession } from "@/lib/get-session";
import { RegisterPage } from "./register";

export default async function Page() {

     const session = await getSession();

     return (
          <>
               <Header user={session?.user ? session.user : null} />
               <RegisterPage />
               <Footer />
          </>

     )
}
