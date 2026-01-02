import { NextResponse } from "next/server";
import { polar } from "@/app/lib/polar";
import log from "@/app/lib/logger";

export const runtime = "nodejs";

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
          log(`Failed to create customer portal session: ${e?.message ?? e}`, "error");
          return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
     }
}
