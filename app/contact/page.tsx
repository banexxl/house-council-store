import { getSessionUser } from "@/app/lib/get-session";

import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ContactPage } from "./contact";
import { logServerAction } from "../lib/server-logging";

export default async function Page() {

  const user = await getSessionUser();

  await logServerAction({
    user_id: user ? user.id : null,
    action: 'Render Contact Page',
    payload: {},
    status: 'success',
    error: '',
    duration_ms: 0
  })

  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

  return (
    <>
      <Header user={user ? user : null} />
      <ContactPage mapKey={mapKey ? mapKey : ""} />
      <Footer />
    </>

  )
}
