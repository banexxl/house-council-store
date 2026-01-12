import type { Metadata } from "next";
import { getSessionUser } from "@/app/lib/get-session";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { ProfilePage } from "./profile";
import { readAccountByEmailAction, readAllApartmentsByClientId, readClientRecentActivityAction } from "./account-action";
import { User } from "@supabase/supabase-js";
import { readCustomerSubscriptionPlanFromCustomerId, readProductFromSubscriptionId, readOrdersByCustomerId } from "./subscription-plan-actions";
import { redirect } from "next/navigation";
import { buildCanonicalUrl } from "../lib/seo";

const canonicalUrl = buildCanonicalUrl("/profile");

export const metadata: Metadata = {
     title: "Account Dashboard | NestLink",
     description: "Manage your NestLink subscription, billing details, and tenant communications from your account dashboard.",
     alternates: {
          canonical: canonicalUrl,
     },
     robots: {
          index: false,
          follow: false,
     },
};

export default async function Page() {
     // Fetch user session
     const user: User | null = await getSessionUser();
     if (!user?.email) {
          // Server-side redirect to sign-in page
          return redirect("/auth/sign-in");
     }

     // Fetch client data
     const { customer, error } = await readAccountByEmailAction(user.email);

     // Fetch related data in parallel
     const [customerSubscriptionObject, recentActivity, apartments, ordersResult] = await Promise.all([
          readCustomerSubscriptionPlanFromCustomerId(customer!.externalId!),
          readClientRecentActivityAction(user.email, customer!.id),
          readAllApartmentsByClientId(customer!.id),
          readOrdersByCustomerId(customer!.customerId!),
     ])

     // Fetch product data from subscription's productId
     const productData = customerSubscriptionObject.customerSubscriptionPlanData?.productId
          ? await readProductFromSubscriptionId(customerSubscriptionObject.customerSubscriptionPlanData.productId)
          : null;

     // Merge session and client data
     const sessionAndCustomerDataCombined = {
          customer: {
               ...customer!,
          },
          session: { ...user },
     };

     const binCheckerAPIKey = process.env.NEXT_PUBLIC_BIN_CHECKER_API_KEY

     return (
          <>
               <Header user={user} />
               <ProfilePage
                    sessionAndCustomerDataCombined={sessionAndCustomerDataCombined}
                    customerSubscriptionObject={customerSubscriptionObject?.customerSubscriptionPlanData! ?? null}
                    recentActivity={recentActivity.data ?? []}
                    apartmentsCount={apartments ? apartments?.data!.length : 0}
                    productData={productData?.product ?? null}
                    payments={ordersResult?.orders ?? null}
               />
               <Footer />
          </>
     );
}
