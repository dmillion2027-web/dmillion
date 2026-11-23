import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, customerEmail, customerName } = req.body;

  if (!amount || amount < 50) {
    return res.status(400).json({ error: 'Amount must be at least $0.50' });
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail,
        customerName: customerName,
      },
      description: `DMILLION Order #${orderId}`,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Payment intent error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
