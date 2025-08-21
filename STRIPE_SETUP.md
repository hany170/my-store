# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for your e-commerce store.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Your Stripe API keys
3. A webhook endpoint URL

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Stripe Dashboard Setup

### 1. Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** > **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your environment variables

### 2. Set Up Webhooks

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
5. Click **Add endpoint**
6. Copy the webhook signing secret and add it to your environment variables

### 3. Configure Payment Methods

1. Go to **Settings** > **Payment methods**
2. Enable the payment methods you want to accept:
   - Credit and debit cards
   - Digital wallets (Apple Pay, Google Pay)
   - Bank transfers (if needed)

## Database Setup

The checkout system will automatically create orders in your database. Make sure you have the following table structure:

```sql
-- Orders table (if not already exists)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

## Testing

### Test Cards

Use these test card numbers for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Test Mode vs Live Mode

- **Test Mode**: Use test API keys (start with `pk_test_` and `sk_test_`)
- **Live Mode**: Use live API keys (start with `pk_live_` and `sk_live_`)

## Features

### Checkout Page Features

1. **Order Summary**: Shows all items in cart with prices
2. **Contact Information**: Collects customer details
3. **Shipping Address**: Collects delivery information
4. **Secure Payment**: Integrated Stripe Checkout
5. **Real-time Calculations**: Subtotal, shipping, tax, and total
6. **Form Validation**: Ensures all required fields are filled
7. **Loading States**: Shows processing status
8. **Error Handling**: Displays user-friendly error messages

### Security Features

1. **SSL Encryption**: All payments are encrypted
2. **PCI DSS Compliance**: Stripe handles PCI compliance
3. **Webhook Verification**: Ensures webhook authenticity
4. **No Card Storage**: Payment information is never stored locally
5. **Secure API Keys**: Server-side only secret keys

### Payment Flow

1. Customer fills out checkout form
2. Form validation ensures all required fields
3. Stripe Checkout session is created
4. Customer is redirected to Stripe's secure payment page
5. After payment, customer is redirected to success page
6. Webhook processes payment confirmation
7. Order is updated in database

## Customization

### Styling

The checkout page follows your app's design theme using:
- Tailwind CSS classes
- Consistent color scheme
- Responsive design
- Modern UI components

### Business Logic

You can customize:
- Shipping calculations
- Tax rates
- Payment methods
- Success/cancel URLs
- Order processing logic

### Localization

The checkout page supports internationalization:
- Currency formatting
- Address formats
- Language support
- Regional tax rules

## Troubleshooting

### Common Issues

1. **"Stripe failed to load"**
   - Check your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Ensure it's a valid publishable key

2. **"Failed to create checkout session"**
   - Check your `STRIPE_SECRET_KEY`
   - Verify the API key has the correct permissions

3. **Webhook errors**
   - Verify your webhook endpoint URL
   - Check the webhook secret
   - Ensure the endpoint is publicly accessible

4. **Payment failures**
   - Use test cards for testing
   - Check Stripe Dashboard for error details
   - Verify payment method configuration

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=stripe:*
```

## Support

For additional help:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- Check the console logs for detailed error messages

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures**
3. **Use HTTPS** in production
4. **Implement proper error handling**
5. **Log security events**
6. **Regular security audits**

## Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Update webhook endpoint URL
- [ ] Test with real payment methods
- [ ] Configure fraud detection
- [ ] Set up monitoring and alerts
- [ ] Review security settings
- [ ] Test webhook reliability
- [ ] Configure backup payment methods
