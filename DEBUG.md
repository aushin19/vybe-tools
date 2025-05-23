# Debug Code Tracking

This file tracks locations of debug code that can be safely removed once the associated functionality is working correctly.

## Active Debug Code

| File Path | Description | Date Added |
|-----------|-------------|------------|
| src/utils/auth-error-handler.ts | Authentication error handling utility - May need adjustment based on actual Supabase error codes | Current Date |
| src/app/auth/login/page.tsx | Form validation and error handling with toast notifications | Current Date |
| src/app/auth/signup/page.tsx | Password strength validation and error handling | Current Date |
| src/lib/razorpay.ts | Razorpay integration utility - Verify webhook secrets and payment validation | Current Date |
| src/app/api/payments/create-order/route.ts | API endpoint for creating Razorpay orders - Check error handling | Current Date |
| src/app/api/payments/verify-payment/route.ts | API endpoint for verifying Razorpay payments - Signature verification is critical | Current Date |
| src/app/api/payments/webhooks/route.ts | Webhook handler for Razorpay events - Ensure proper signature validation | Current Date |
| src/app/checkout/page.tsx | Client-side Razorpay integration - May need adjustment based on testing | Current Date |

## Razorpay Integration Notes

1. **Environment Variables**: 
   - Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET` are properly set in the environment.
   - For development, use Test Mode in the Razorpay dashboard.

2. **Critical Security Points**:
   - Payment signature verification in `verify-payment` API route
   - Webhook signature verification in `webhooks` API route
   - Never expose `NEXT_PUBLIC_RAZORPAY_KEY_SECRET` to the client side

3. **Testing Process**:
   - Use Razorpay test cards for payment testing
   - Test webhook handling with Razorpay's webhook simulator
   - Verify subscription creation after successful payment

4. **Common Issues**:
   - Incorrect signature verification
   - Missing `x-razorpay-signature` header in webhook requests
   - Mismatched currency codes (should be INR for Indian Rupees)
   - Amount calculation issues (Razorpay uses amount in paise, not rupees)

## Removed Debug Code

| File Path | Description | Date Added | Date Removed |
|-----------|-------------|------------|--------------|
| *No debug code removed yet* | | | |

## Notes

- Always add a comment with `DEBUG:` prefix before any code added for debugging purposes
- When implementing Razorpay in production, ensure proper error handling and logging
- Use try-catch blocks extensively in payment processing code
- Always update this file when adding or removing debug code
- Include enough context in debug messages to identify the source 
- The current auth error handling implementation may need adjustments based on actual Supabase error codes encountered in production
- Password strength validation in signup page may need fine-tuning for better user experience 