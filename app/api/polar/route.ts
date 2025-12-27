import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";

export const runtime = "nodejs";

export async function POST(req: Request) {
     try {
          const body = await req.json();
          const { clientId, subscriptionPlanId, successUrl, returnUrl, productIds } = body as {
               clientId: string;
               subscriptionPlanId: string;
               successUrl: string;
               returnUrl: string;
               productIds: string[];
          };

          if (!clientId || !subscriptionPlanId || !successUrl || !returnUrl || !productIds?.length) {
               return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
          }

          // Polar Checkout Session API: create session from list of products
          const checkout = await polar.checkouts.create({
               products: productIds,
               successUrl: successUrl,
               returnUrl: returnUrl,
               metadata: {
                    clientId,
                    subscriptionPlanId,
               },
          });

          return NextResponse.json({ url: checkout.url, checkoutId: checkout.id });
     } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}
