'use server'

import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ResetPasswordPage } from "./reset-password";
import { verifyRecoveryToken } from "./reset-password-actions";

interface ResetPasswordPageProps {
     searchParams: {
          token?: string;
          email?: string;
     };
}

export default async function Page({ searchParams }: ResetPasswordPageProps) {
     const user = await getSessionUser();

     const tokenHash = searchParams.token;
     const email = searchParams.email;

     const isTokenValid = await verifyRecoveryToken(email || '', tokenHash || '');

     return (
          <>
               <Header user={user || null} />
               <ResetPasswordPage isTokenValid={isTokenValid.success} />
               <Footer />
          </>
     );
}
