import { getSession } from "@/lib/get-session";
import HomePage from "./home-page";
import Footer from "@/components/Footer";
import Header from "@/components/Header";


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
