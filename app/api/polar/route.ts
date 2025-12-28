import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";

export const runtime = "nodejs";

export async function POST(req: Request) {
     try {
          const body = await req.json();
          const { clientId, customerEmail, subscriptionPlanId, renewal_period, successUrl, returnUrl, productIds, amount } = body as {
               clientId: string;
               customerEmail?: string;
               subscriptionPlanId: string;
               renewal_period: "monthly" | "annually";
               successUrl: string;
               returnUrl: string;
               productIds: string[];
               amount: number;
          };

          if (!clientId || !customerEmail || !subscriptionPlanId || !successUrl || !returnUrl || !productIds?.length || !amount || !renewal_period) {
               return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
          }

          // Polar Checkout Session API: create session from list of products
          const checkout = await polar.checkouts.create({
               products: productIds,
               successUrl: successUrl,
               returnUrl: returnUrl,
               customerEmail: customerEmail,
               metadata: {
                    clientId,
                    subscriptionPlanId,
                    apartments_count: amount
               },
          });

          return NextResponse.json({ url: checkout.url, checkoutId: checkout.id });
     } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}
