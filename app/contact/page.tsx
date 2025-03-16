import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ContactPage } from "./contact";

export default async function Page() {

  const user = await getSessionUser();

  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

  return (
    <>
      <Header user={user ? user : null} />
      <ContactPage mapKey={mapKey ? mapKey : ""} />
      <Footer />
    </>

  )
}
