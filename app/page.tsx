import { getSession } from "@/lib/get-session";
import HomePage from "./home";
import Footer from "@/components/footer";
import Header from "@/components/header";


export default async function Page() {

  const session = await getSession();

  return (
    <>
      <Header user={session?.user ? session.user : null} />
      <HomePage />
      <Footer />
    </>

  )
}
