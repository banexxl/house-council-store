import { inngest } from "@/inngest/client";
import { checkAllClientSubscriptions } from "@/inngest/functions/check-free-trials";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
     client: inngest,
     functions: [
          checkAllClientSubscriptions
     ],
});
