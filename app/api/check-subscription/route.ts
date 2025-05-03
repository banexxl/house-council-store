// app/api/subscription/check-expired/route.ts
import { useServerSideSupabaseServiceRoleClient } from '@/app/lib/ss-supabase-service-role-client'
import { NextResponse } from 'next/server'
import { logServerAction } from '@/app/lib/server-logging'

export async function POST() {
     const supabase = await useServerSideSupabaseServiceRoleClient()

     // Fetch all client subscriptions
     const { data: subscriptions, error } = await supabase
          .from('tblClient_Subscription')
          .select('id, client_id, status, next_payment_date')

     await logServerAction({
          user_id: null,
          action: 'Check all subscriptions',
          payload: {},
          status: error ? 'fail' : 'success',
          error: error?.message || '',
          duration_ms: 0,
          type: 'db'
     })

     if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
     }

     const now = new Date()
     let updatedCount = 0
     const results: { clientId: string; status: string; expired: boolean }[] = []

     for (const sub of subscriptions || []) {
          const nextPaymentDate = sub.next_payment_date ? new Date(sub.next_payment_date) : null

          // Determine if the subscription is expired
          const isExpired =
               sub.status === 'canceled' ||
               (!!nextPaymentDate && nextPaymentDate < now)

          // If expired, soft-delete by updating status to 'expired'
          if (isExpired) {
               const { error: updateError } = await supabase
                    .from('tblClient_Subscription')
                    .update({
                         status: 'expired',
                         updated_at: now.toISOString()
                    })
                    .eq('id', sub.id)

               // Log the expiration action
               await logServerAction({
                    user_id: null,
                    action: 'Auto-expire subscription',
                    payload: { subscriptionId: sub.id, clientId: sub.client_id },
                    status: updateError ? 'fail' : 'success',
                    error: updateError?.message || '',
                    duration_ms: 0,
                    type: 'db'
               })

               if (!updateError) updatedCount++
          }

          // Log if subscription is set to expire in exactly 7, 3, or 1 days
          if (nextPaymentDate && sub.status !== 'expired') {
               const daysUntilExpiration = Math.ceil(
                    (nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
               )

               if ([7, 3, 1].includes(daysUntilExpiration)) {
                    await logServerAction({
                         user_id: null,
                         action: `Upcoming expiration in ${daysUntilExpiration} day(s)`,
                         payload: {
                              subscriptionId: sub.id,
                              clientId: sub.client_id,
                              daysUntilExpiration,
                              expirationDate: nextPaymentDate.toISOString()
                         },
                         status: 'success',
                         error: '',
                         duration_ms: 0,
                         type: 'db'
                    })
               }
          }

          // Add result to summary array
          results.push({
               clientId: sub.client_id,
               status: isExpired ? 'expired' : sub.status,
               expired: isExpired
          })
     }

     // Return summary of operations
     return NextResponse.json({
          success: true,
          checked: results.length,
          updated: updatedCount,
          results
     })
}