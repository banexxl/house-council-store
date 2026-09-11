/**
 * Cache tag helpers shared between the cached Polar/account reads
 * (app/profile/subscription-plan-actions.ts, app/profile/account-action.ts)
 * and the Polar webhook handlers that invalidate them after a write
 * (app/api/polar/webhook/{subscription,order,customer,product}/route.ts).
 *
 * Kept in a plain module (not a 'use server' file) because Next.js requires
 * every export of a 'use server' file to be an async function, and these are
 * synchronous string builders, not actions.
 */
export const polarCustomerTag = (customerId: string) => `polar-customer-${customerId}`;
export const polarProductTag = (productId: string) => `polar-product-${productId}`;
