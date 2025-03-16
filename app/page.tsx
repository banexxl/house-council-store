'use server'

import { getSessionUser } from "@/lib/get-session";
import HomePage from "./home";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";


export default async function Page() {

  const user = await getSessionUser();

  return (
    <>
      <Header user={user ? user : null} />
      <HomePage />
      <Footer />
    </>

  )
}
