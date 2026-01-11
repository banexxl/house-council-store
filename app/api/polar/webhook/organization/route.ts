// app/api/polar/webhook/organization/route.ts
import { logServerAction } from "@/app/lib/server-logging";
import { PolarOrganization } from "@/app/types/polar-organization-types";
import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ✅ Webhooks should use SERVICE ROLE (bypasses RLS)
const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SB_SERVICE_KEY!
);

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function convertOrganizationToPolarOrganization(org: any): PolarOrganization {
     return {
          id: org.id,
          createdAt: org.createdAt instanceof Date ? org.createdAt.toISOString() : org.createdAt,
          modifiedAt: org.modifiedAt instanceof Date ? org.modifiedAt.toISOString() : org.modifiedAt,
          name: org.name,
          slug: org.slug,
          avatarUrl: org.avatarUrl ?? org.avatar_url ?? "",
          prorationBehavior: org.prorationBehavior ?? org.proration_behavior ?? "none",
          allowCustomerUpdates: org.allowCustomerUpdates ?? org.allow_customer_updates ?? false,
          email: org.email ?? "",
          website: org.website ?? "",
          socials: org.socials ?? [],
          status: org.status ?? "",
          detailsSubmittedAt: org.detailsSubmittedAt ?? org.details_submitted_at ?? null,
          featureSettings: org.featureSettings ?? org.feature_settings ?? {
               issueFundingEnabled: false,
               seatBasedPricingEnabled: false,
               revopsEnabled: false,
               walletsEnabled: false,
          },
          subscriptionSettings: org.subscriptionSettings ?? org.subscription_settings ?? {
               allowMultipleSubscriptions: false,
               allowCustomerUpdates: false,
               prorationBehavior: "none",
               benefitRevocationGracePeriod: 0,
               preventTrialAbuse: false,
          },
          notificationSettings: org.notificationSettings ?? org.notification_settings ?? {
               newOrder: false,
               newSubscription: false,
          },
          customerEmailSettings: org.customerEmailSettings ?? org.customer_email_settings ?? {
               orderConfirmation: false,
               subscriptionCancellation: false,
               subscriptionConfirmation: false,
               subscriptionCycled: false,
               subscriptionPastDue: false,
               subscriptionRevoked: false,
               subscriptionUncanceled: false,
               subscriptionUpdated: false,
          },
     };
}

async function upsertOrganization(organization: PolarOrganization, eventType: string) {
     const t0 = Date.now();

     const orgData = {
          id: organization.id,
          createdAt: organization.createdAt,
          modifiedAt: organization.modifiedAt,
          name: organization.name,
          slug: organization.slug,
          avatarUrl: organization.avatarUrl,
          prorationBehavior: organization.prorationBehavior,
          allowCustomerUpdates: organization.allowCustomerUpdates,
          email: organization.email,
          website: organization.website,
          socials: organization.socials,
          status: organization.status,
          detailsSubmittedAt: organization.detailsSubmittedAt,
          featureSettings: organization.featureSettings,
          subscriptionSettings: organization.subscriptionSettings,
          notificationSettings: organization.notificationSettings,
          customerEmailSettings: organization.customerEmailSettings,
     };

     const { data, error } = await supabase
          .from("tblPolarOrganizations")
          .upsert(orgData, { onConflict: "id" })
          .select()
          .single();

     const duration = Date.now() - t0;

     if (error) {
          await logServerAction({
               user_id: null,
               action: `${eventType} - Upsert Organization Failed`,
               payload: {
                    organizationId: organization.id,
                    errorCode: error.code,
                    errorMessage: error.message,
                    errorDetails: error.details,
                    errorHint: error.hint,
               },
               status: "fail",
               error: error.message,
               duration_ms: duration,
               type: "webhook",
          });
          throw error;
     }

     await logServerAction({
          user_id: null,
          action: `${eventType} - Upsert Organization`,
          payload: { organizationId: organization.id },
          status: "success",
          error: "",
          duration_ms: duration,
          type: "webhook",
     });

     return data;
}

// ---------------------------------------------------------------------------
// Organization Webhook Handler
// ---------------------------------------------------------------------------

export const POST = Webhooks({
     webhookSecret: process.env.POLAR_WEBHOOK_SECRET_SANDBOX_ORGANIZATION!,


     onOrganizationUpdated: async (payload) => {
          const eventType = "organization.updated";
          console.log(`${eventType} webhook received:`, payload);

          try {
               const organization = convertOrganizationToPolarOrganization(payload.data);
               await upsertOrganization(organization, eventType);
               console.log(`${eventType} processed successfully for organization:`, organization.id);
          } catch (error) {
               console.error(`Error processing ${eventType}:`, error);
               throw error;
          }
     },
});
