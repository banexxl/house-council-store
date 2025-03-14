import { getSession } from "@/lib/get-session";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { DocsPage } from "./docs";

export default async function Page() {

  const session = await getSession();

  return (
    <>
      <Header user={session?.user ? session.user : null} />
      <DocsPage />
      <Footer />
    </>

  )
}
