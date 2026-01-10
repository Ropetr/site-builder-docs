/**
 * Billing routes - Stripe integration
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { queryOne, execute } from '../lib/db';

const billing = new Hono<{ Bindings: Env }>();

billing.use('/*', authMiddleware);

// POST /billing/checkout - Create Stripe checkout session
billing.post('/checkout', requirePermission('billing:manage'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { plan_id } = body;

  if (!plan_id) {
    return c.json({ error: 'plan_id required' }, 400);
  }

  // TODO: Replace with real Stripe API call
  // const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({...});

  // Mock checkout URL for now
  const checkoutUrl = `https://checkout.stripe.com/mock?plan=${plan_id}`;

  return c.json({ checkout_url: checkoutUrl });
});

// POST /billing/webhook - Stripe webhook handler
billing.post('/webhook', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('stripe-signature');

  if (!sig) {
    return c.json({ error: 'No signature' }, 400);
  }

  // TODO: Verify webhook signature
  // const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  // const event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);

  // Mock event handling
  const event = JSON.parse(body);

  switch (event.type) {
    case 'checkout.session.completed':
      // Create subscription
      break;
    case 'customer.subscription.updated':
      // Update subscription status
      break;
    case 'customer.subscription.deleted':
      // Cancel subscription
      break;
    case 'invoice.payment_failed':
      // Handle dunning
      break;
  }

  return c.json({ received: true });
});

// GET /billing/subscription - Get current subscription
billing.get('/subscription', requirePermission('billing:view'), async (c) => {
  const user = c.get('user');

  const subscription = await queryOne(
    c.env.DB,
    'SELECT * FROM subscriptions WHERE tenant_id = ? AND status = ?',
    [user.tenantId, 'active']
  );

  return c.json(subscription || {});
});

export default billing;
