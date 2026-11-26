import nodemailer from 'nodemailer';

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

  const {
    to,
    customer_name,
    tracking_number,
    new_status,
    order_total,
  } = req.body;

  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Status messages and colors
    const statusMessages = {
      pending: 'Your order has been received and is awaiting processing.',
      processing: 'Your order is being carefully prepared for shipment.',
      shipped: 'Your order is on its way! Track your package with the number below.',
      delivered: 'Your order has been delivered successfully. Thank you for shopping with us!',
    };

    const statusEmojis = {
      pending: '📋',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Playfair Display', serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e8d5b7; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1a1a1a; margin: 0; font-size: 32px; }
        .header p { color: #999; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 2px; }
        .content { padding: 20px 0; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 15px; line-height: 1.6; }
        .status-banner { background: linear-gradient(135deg, #e8d5b7 0%, #d4c1a3 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .status-banner h2 { color: #1a1a1a; margin: 0 0 10px 0; font-size: 24px; }
        .status-banner p { color: #1a1a1a; margin: 0; font-size: 14px; line-height: 1.6; }
        .tracking-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; margin: 15px 0; }
        .tracking-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .tracking-number { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8d5b7; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; }
        .info-value { color: #1a1a1a; font-weight: 600; }
        .footer { text-align: center; border-top: 2px solid #e8d5b7; padding-top: 20px; margin-top: 30px; color: #999; font-size: 12px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DMILLION</h1>
            <p>LUXURY FASHION</p>
        </div>

        <div class="content">
            <p class="greeting">Hello <strong>${customer_name}</strong>,</p>
            
            <div class="status-banner">
                <h2>${statusEmojis[new_status] || '📦'} Order Status Updated</h2>
                <p style="font-size: 18px; font-weight: 600; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">${new_status}</p>
            </div>

            <p class="greeting" style="margin-top: 20px;">
                ${statusMessages[new_status] || 'Your order status has been updated.'}
            </p>

            <div class="tracking-box">
                <div class="tracking-label">Tracking Number</div>
                <div class="tracking-number">${tracking_number}</div>
            </div>

            <div class="tracking-box">
                <div class="info-row">
                    <span class="info-label">Order Total:</span>
                    <span class="info-value">${order_total}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="text-transform: capitalize;">${new_status}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Updated At:</span>
                    <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Questions about your order? We're here to help.<br>
                    <a href="mailto:support@dmillion.com" style="color: #e8d5b7; text-decoration: none; font-weight: 600;">contact us</a>
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>DMILLION LUXURY FASHION</strong></p>
            <p style="margin-top: 15px; border-top: 1px solid #e8d5b7; padding-top: 15px;">
                © 2026 DMILLION. All rights reserved.<br>
                Follow us: @dmillion_luxury
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `DMILLION <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Your Order Status Updated - ${new_status.toUpperCase()} - ${tracking_number}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Status email sent:', info.response);

    return res.status(200).json({
      success: true,
      message: 'Status update email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Status email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
