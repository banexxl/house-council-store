import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";

export default async function Page() {

     const user: User | null = await getSessionUser();

     const { data, error } = user?.email
          ? await readAccountByEmailAction(user.email)
          : { data: null, error: 'No email provided' };

     const sessionAndClientDataCombined = user && (data)
          ? { client: { clientInitialValues, ...data }, session: { ...user } } // Ensures session is always a User
          : undefined; // Ensure undefined instead of incorrect types

     return (
          <>
               <Header user={user ? user : null} />
               <ProfilePage sessionAndClientDataCombined={sessionAndClientDataCombined} />
               <Footer />
          </>

     )
}
