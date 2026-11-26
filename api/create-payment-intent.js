import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers - allow all origins for now
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, customerEmail, customerName } = req.body;

  console.log('💰 Payment Intent Request:', { amount, orderId, customerEmail, customerName });

  // Ensure amount is a number and at least 50 cents (in dollars, will be converted to cents)
  const amountInDollars = parseFloat(amount);
  
  if (!amountInDollars || amountInDollars < 0.50) {
    console.error('❌ Invalid amount:', { received: amount, parsed: amountInDollars });
    return res.status(400).json({ error: `Amount must be at least $0.50. Received: $${amountInDollars || 'invalid'}` });
  }

  try {
    // Create payment intent
    const amountInCents = Math.round(amountInDollars * 100);
    console.log('✅ Creating Stripe payment intent:', { amountInDollars, amountInCents, currency: 'usd' });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail,
        customerName: customerName,
      },
      description: `DMILLION Order #${orderId}`,
    });

    console.log('✅ Payment intent created:', paymentIntent.id);
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
