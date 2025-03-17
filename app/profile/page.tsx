import { getSessionUser } from "@/lib/get-session";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { clientInitialValues } from "../types/client";
import { readEntity } from "@/lib/base-entity-actions";

export default async function Page() {

     const user: User | null = await getSessionUser();

     const { data, error } = await readAccountByEmailAction(user?.email!);

     if (!data) {
          throw new Error(error || "Failed to fetch account data");
     }

     // Fetch related entities in parallel
     const [role, client_status, client_type] = await Promise.all([
          readEntity("tblClientRoles", data.role_id),
          readEntity("tblClientStatuses", data.client_status),
          readEntity("tblClientTypes", data.type),
     ]);

     const sessionAndClientDataCombined = user && data ? {
          client: {
               ...clientInitialValues,
               ...data,
               role_id: role?.entity?.name ?? '',
               client_status: client_status?.entity?.name ?? '',
               type: client_type?.entity?.name ?? '',
          },
          session: { ...user },
     } : undefined;


     return (
          <>
               <Header user={user ? user : null} />
               <ProfilePage sessionAndClientDataCombined={sessionAndClientDataCombined} />
               <Footer />
          </>

     )
}
