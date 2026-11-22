import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    to,
    customer_name,
    tracking_number,
    order_total,
    shipping_address,
    order_items,
    contact_email,
  } = req.body;

  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use Gmail App Password, not regular password
      },
    });

    // Email HTML template
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
        .section { margin-bottom: 30px; }
        .section h2 { color: #1a1a1a; font-size: 18px; border-bottom: 1px solid #e8d5b7; padding-bottom: 10px; margin: 0 0 15px 0; }
        .tracking-box { background: linear-gradient(135deg, #e8d5b7 0%, #d4c1a3 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 15px 0; }
        .tracking-box p { margin: 0; color: #1a1a1a; font-weight: 600; }
        .tracking-box .number { font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 10px 0; }
        .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8d5b7; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; }
        .detail-value { color: #1a1a1a; font-weight: 600; }
        .total-row { font-weight: bold; font-size: 18px; color: #1a1a1a; padding-top: 10px; border-top: 2px solid #e8d5b7; }
        .items-list { margin: 15px 0; padding: 15px; background: #fafafa; border-radius: 8px; border-left: 4px solid #e8d5b7; }
        .items-list p { margin: 8px 0; color: #333; font-size: 14px; line-height: 1.5; }
        .address-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; color: #333; font-size: 14px; line-height: 1.6; margin: 15px 0; }
        .cta-button { display: inline-block; background: #1a1a1a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; border-top: 2px solid #e8d5b7; padding-top: 20px; margin-top: 30px; color: #999; font-size: 12px; line-height: 1.6; }
        .footer a { color: #e8d5b7; text-decoration: none; }
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
            <p class="greeting">Your DMILLION luxury order has been confirmed and is being carefully prepared for shipment. Thank you for choosing premium fashion.</p>

            <div class="section">
                <h2>🎯 Tracking Information</h2>
                <div class="tracking-box">
                    <p>YOUR TRACKING NUMBER</p>
                    <div class="number">${tracking_number}</div>
                    <p style="font-size: 12px; color: #555; margin-top: 10px;">Save this number to track your order anytime</p>
                </div>
            </div>

            <div class="section">
                <h2>📋 Order Summary</h2>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">${order_total}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Shipping:</span>
                        <span class="detail-value" style="color: #27ae60;">FREE</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🛍️ Items Ordered</h2>
                <div class="items-list">
                    <p>${order_items}</p>
                </div>
            </div>

            <div class="section">
                <h2>📦 Shipping Address</h2>
                <div class="address-box">
                    ${shipping_address}
                </div>
            </div>

            <div class="section" style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Questions?</strong> Our luxury concierge is here to help!<br>
                    <a href="mailto:${contact_email}" style="color: #e8d5b7; text-decoration: none; font-weight: 600;">${contact_email}</a>
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

    // Send email
    const mailOptions = {
      from: `DMILLION <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Your DMILLION Order Confirmed - Tracking ${tracking_number}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);

    return res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
