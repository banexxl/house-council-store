import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DocsPage } from "./docs";

export default async function Page() {

  const user = await getSessionUser();

  return (
    <>
      <Header user={user ? user : null} />
      <DocsPage />
      <Footer />
    </>

  )
}
