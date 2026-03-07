/**
 * Stripe API endpoints
 * - POST /api/stripe/checkout — Create a Checkout Session for $4.99/month subscription
 * - POST /api/stripe/webhook — Handle Stripe webhook events (subscription status changes)
 * - POST /api/stripe/portal — Create a Customer Portal session (manage subscription)
 */

import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { adminDb } from '../engine/firebaseAdmin';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PRICE_ID = process.env.STRIPE_PRICE_ID || ''; // Monthly $4.99 price
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Create a Stripe Checkout Session
 * Requires authenticated user (uid from Firebase token)
 */
export async function handleCheckout(req: Request, res: Response) {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const { uid, email } = req.body as { uid: string; email: string };

  if (!uid || !email) {
    res.status(400).json({ error: 'uid and email required' });
    return;
  }

  if (!PRICE_ID) {
    res.status(500).json({ error: 'Stripe not configured' });
    return;
  }

  try {
    // Check if user already has a Stripe customer
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    let customerId = userSnap.data()?.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
      await userRef.update({ stripeCustomerId: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${req.headers.origin || 'https://tallyaero.com'}/dashtwo?upgraded=true`,
      cancel_url: `${req.headers.origin || 'https://tallyaero.com'}/dashtwo`,
      metadata: { firebaseUid: uid },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

/**
 * Create a Stripe Customer Portal session (manage/cancel subscription)
 */
export async function handlePortal(req: Request, res: Response) {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const { uid } = req.body as { uid: string };

  if (!uid) {
    res.status(400).json({ error: 'uid required' });
    return;
  }

  try {
    const userSnap = await adminDb.collection('users').doc(uid).get();
    const customerId = userSnap.data()?.stripeCustomerId;

    if (!customerId) {
      res.status(400).json({ error: 'No subscription found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin || 'https://tallyaero.com'}/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
}

/**
 * Handle Stripe webhook events
 * Updates user tier in Firestore when subscription status changes
 */
export async function handleWebhook(req: Request, res: Response) {
  if (!stripe) { res.status(500).json({ error: 'Stripe not configured' }); return; }
  const sig = req.headers['stripe-signature'] as string;

  if (!sig || !WEBHOOK_SECRET) {
    res.status(400).json({ error: 'Missing signature or webhook secret' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe] Webhook verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUid;
        if (uid) {
          await adminDb.collection('users').doc(uid).update({
            tier: 'paid',
            stripeSubscriptionId: session.subscription,
            paidSince: new Date().toISOString(),
          });
          console.log(`[Stripe] User ${uid} upgraded to paid`);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const usersSnap = await adminDb.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';

          if (isActive) {
            await userDoc.ref.update({ tier: 'paid' });
          } else {
            // Downgrade — keep verified status if they had it
            const data = userDoc.data();
            const newTier = data.verificationStatus?.startsWith('verified') ? 'verified' : 'free';
            await userDoc.ref.update({ tier: newTier, stripeSubscriptionId: null });
            console.log(`[Stripe] User ${userDoc.id} downgraded to ${newTier}`);
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe] Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
