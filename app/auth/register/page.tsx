import { getSessionUser } from "@/lib/get-session";
import { RegisterPage } from "./register";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default async function Page() {

     const user = await getSessionUser();

     return (
          <>
               <Header user={user ? user : null} />
               <RegisterPage />
               <Footer />
          </>

     )
}
