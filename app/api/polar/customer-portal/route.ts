import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";
import log from "@/app/lib/logger";

export const runtime = "nodejs";

const isCustomerNotFoundError = (err: unknown): boolean => {
     const detail = (err as { detail?: Array<{ msg?: string }> })?.detail;
     if (Array.isArray(detail) && detail.some((item) => item?.msg?.includes("Customer does not exist"))) {
          return true;
     }

     const message = typeof (err as { message?: unknown })?.message === "string"
          ? String((err as { message?: unknown }).message)
          : typeof err === "string"
               ? err
               : "";

     if (message.includes("Customer does not exist")) {
          return true;
     }

     const body = typeof (err as { body$?: unknown })?.body$ === "string"
          ? String((err as { body$?: unknown }).body$)
          : "";
     return body.includes("Customer does not exist");
};

export async function POST(req: Request) {
     try {
          const body = await req.json();
          const { polarCustomerId, returnUrl } = body as {
               polarCustomerId?: string;
               returnUrl?: string | null;
          };

          if (!polarCustomerId) {
               return NextResponse.json({ error: "Missing polarCustomerId" }, { status: 400 });
          }

          const session = await polar.customerSessions.create({
               customerId: polarCustomerId,
               returnUrl: returnUrl || null,
          });

          if (!session?.customerPortalUrl) {
               return NextResponse.json({ error: "Customer portal URL missing" }, { status: 500 });
          }

          return NextResponse.json({ url: session.customerPortalUrl });
     } catch (e: any) {
          if (isCustomerNotFoundError(e)) {
               return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
          }
          log(`Failed to create customer portal session: ${e?.message ?? e}`, "error");
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}
