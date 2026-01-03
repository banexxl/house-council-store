import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import log from "@/app/lib/logger";
import { logServerAction } from "@/app/lib/server-logging";

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
          let checkout;
          try {
               checkout = await polar.checkouts.create({
                    products: productIds,
                    successUrl,
                    returnUrl,
                    customerEmail,
                    metadata: {
                         clientId,
                         subscriptionPlanId,
                         renewal_period,
                         apartments_count: apartmentsCount,
                    },
               });
          } catch (error) {
               console.error("Error creating checkout:", error);
               throw error;
          }
          return NextResponse.json({ url: checkout.url, checkoutId: checkout.id });
     } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}

export async function DELETE(req: Request) {
     try {
          const { subscriptionId, polarCustomerId } = await req.json();
          log(`Subscription id: ${subscriptionId}, polar customer id: ${polarCustomerId}`, 'info');

          if (!subscriptionId || !polarCustomerId) {
               return NextResponse.json({ error: "Missing subscriptionId or clientId" }, { status: 400 });
          }

          const result = await polar.customerSessions.create({
               customerId: polarCustomerId,
          });

          let canceled;
          try {
               canceled = await polar.subscriptions.revoke({
                    id: subscriptionId,
               });
          } catch (error) {
               log(`Failed to cancel subscription ${error}`, 'error');
               await logServerAction({
                    user_id: null,
                    action: 'Cancel subscription - error',
                    payload: { subscriptionId, polarCustomerId },
                    status: 'fail',
                    error: canceled ? JSON.stringify(canceled) : 'Unknown error',
                    duration_ms: 0,
                    type: 'webhook'
               })
               throw error;
          }

          revalidatePath("/profile");
          return NextResponse.json({
               message: "Subscription set to cancel at period end",
               subscription: canceled,
          });
     } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}

export async function PUT(req: Request) {
     try {
          const { subscriptionId, polarCustomerId } = await req.json();

          log(
               `Reactivate request. subscriptionId=${subscriptionId}, polarCustomerId=${polarCustomerId}`,
               "info"
          );

          if (!subscriptionId || !polarCustomerId) {
               return NextResponse.json(
                    { error: "Missing subscriptionId or polarCustomerId" },
                    { status: 400 }
               );
          }

          // 1) Create a customer session token (acts like "customer auth" for portal endpoints)
          const session = await polar.customerSessions.create({
               customerId: polarCustomerId,
          });

          // 2) Update subscription: undo "cancel at period end" (reactivate auto-renew)
          // Customer Portal "Update Subscription" is PATCH /v1/customer-portal/subscriptions/{id}
          // Setting cancel_at_period_end=false is the typical "uncancel" action.
          let updated;
          try {
               updated = await polar.customerPortal.subscriptions.update(
                    { customerSession: session.token },
                    {
                         id: subscriptionId,
                         customerSubscriptionUpdate: {
                              cancelAtPeriodEnd: true,
                         },
                    }
               );
               log(
                    `Subscription ${subscriptionId} reactivation request processed successfully`,
                    "info"
               );
          } catch (error) {
               log(
                    `Failed to reactivate subscription ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`,
                    "error"
               );
               throw error;
          }

          revalidatePath("/profile");

          await logServerAction({
               user_id: null,
               action: "Reactivate subscription - success",
               payload: { subscriptionId, polarCustomerId },
               status: "success",
               error: "",
               duration_ms: 0,
               type: "webhook",
          });

          return NextResponse.json({
               message: "Subscription reactivated (auto-renew resumed).",
               subscription: updated,
          });
     } catch (e: any) {
          return NextResponse.json(
               { error: e?.message ?? "Unknown error" },
               { status: 500 }
          );
     }
}

