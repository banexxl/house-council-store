import { inngest } from "../client";

export const checkAllClientSubscriptions = inngest.createFunction(
     { id: "check-all-client-subscriptions" },
     { cron: "0 0 * * *" }, // every midnight
     async ({ step }) => {
          try {
               const response = await fetch(`${process.env.BASE_URL}/api/check-subscription/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
               });

               if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to check subscriptions: ${response.status} - ${errorText}`);
               }

               const result = await response.json();

               // Optional: log summary or handle expired accounts here
               console.log(`[Inngest] Checked ${result.checked} subscriptions. Marked ${result.updated} as expired.`);

               // Optional: step.run() can be used for sub - steps like sending alerts
               await step.run("Log subscription check result", async () => {
                    return result;
               });

               return {
                    success: true,
                    summary: {
                         checked: result.checked,
                         updated: result.updated,
                    },
               };
          } catch (err: any) {
               console.error(`[Inngest] Error during subscription check:`, err.message);
               return {
                    success: false,
                    error: err.message,
               };
          }
     }
);
