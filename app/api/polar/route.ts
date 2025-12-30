import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getApartmentCountForClient(clientId: string): Promise<number> {
     const { count, error } = await supabase
          .from("tblApartments")
          .select("id, tblBuildings!inner(client_id)", { count: "exact", head: true })
          .eq("tblBuildings.client_id", clientId);
     console.log('error', error);

     if (error) throw error;
     return count ?? 0;
}

export async function POST(req: Request) {
     try {
          const body = await req.json();
          const {
               clientId,
               customerEmail,
               subscriptionPlanId,
               renewal_period,
               successUrl,
               returnUrl,
               productIds,
          } = body as {
               clientId: string;
               customerEmail?: string;
               subscriptionPlanId: string;
               renewal_period: "monthly" | "annually";
               successUrl: string;
               returnUrl: string;
               productIds: string[];
          };

          if (
               !clientId ||
               !customerEmail ||
               !subscriptionPlanId ||
               !successUrl ||
               !returnUrl ||
               !productIds?.length ||
               !renewal_period
          ) {
               return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
          }

          // ✅ server-truth seats
          const apartmentsCount = await getApartmentCountForClient(clientId);
          const seats = Math.max(1, apartmentsCount);

          let checkout;
          try {
               checkout = await polar.checkouts.create({
                    products: productIds,
                    successUrl,
                    returnUrl,
                    customerEmail,

                    // ✅ correct field for CheckoutCreate in @polar-sh/nextjs
                    seats,

                    metadata: {
                         clientId,
                         subscriptionPlanId,
                         renewal_period,
                         apartments_count: apartmentsCount,
                         seats_charged: seats,
                    },
               });
          } catch (error) {
               console.error("Error creating checkout:", error);
               throw error;
          }


          return NextResponse.json({ url: checkout.url, checkoutId: checkout.id, seats });
     } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}
