import { getSessionUser } from "@/app/lib/get-session";
import { RegisterPage } from "./register";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";

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
