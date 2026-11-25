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

  console.log('📧 Email request received:', { to, customer_name, tracking_number });

  try {
    // Check if credentials are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Gmail credentials missing!', {
        user: process.env.GMAIL_USER ? '***SET***' : 'NOT SET',
        password: process.env.GMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET',
      });
      return res.status(500).json({ error: 'Gmail credentials not configured' });
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('📧 Transporter created for:', process.env.GMAIL_USER);

    // Email HTML template with spam-safe styling
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background-color: #f5f5f5; 
            margin: 0; 
            padding: 0; 
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #e8d5b7; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #1a1a1a; 
            margin: 0; 
            font-size: 28px; 
        }
        .header p { 
            color: #999; 
            margin: 5px 0 0 0; 
            font-size: 12px; 
            letter-spacing: 2px; 
        }
        .content { 
            padding: 20px 0; 
        }
        .greeting { 
            font-size: 16px; 
            color: #333; 
            margin-bottom: 15px; 
            line-height: 1.6; 
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section h2 { 
            color: #1a1a1a; 
            font-size: 18px; 
            margin: 0 0 15px 0; 
            border-bottom: 1px solid #e8d5b7;
            padding-bottom: 10px;
        }
        .tracking-box { 
            background: #f9f9f9; 
            padding: 20px; 
            border-left: 4px solid #e8d5b7; 
            border-radius: 4px; 
            margin: 15px 0; 
            text-align: center;
        }
        .tracking-number { 
            font-size: 24px; 
            font-weight: bold; 
            font-family: monospace; 
            letter-spacing: 2px; 
            margin: 10px 0; 
            color: #1a1a1a;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #eee; 
            font-size: 14px; 
        }
        .detail-label { 
            color: #666; 
            font-weight: normal;
        }
        .detail-value { 
            color: #1a1a1a; 
            font-weight: bold; 
        }
        .footer { 
            text-align: center; 
            border-top: 1px solid #e8d5b7; 
            padding-top: 20px; 
            margin-top: 30px; 
            color: #999; 
            font-size: 12px; 
        }
        .footer a { 
            color: #e8d5b7; 
            text-decoration: none; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DMILLION</h1>
            <p>LUXURY FASHION</p>
        </div>

        <div class="content">
            <p class="greeting">Dear <strong>${customer_name}</strong>,</p>
            <p class="greeting">Thank you for your purchase! Your DMILLION luxury order has been confirmed and is being carefully prepared for shipment.</p>

            <div class="section">
                <h2>Tracking Information</h2>
                <div class="tracking-box">
                    <p style="margin: 0; color: #666;">YOUR TRACKING NUMBER</p>
                    <div class="tracking-number">${tracking_number}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Save this number to track your order</p>
                </div>
            </div>

            <div class="section">
                <h2>Order Summary</h2>
                <div class="detail-row">
                    <span class="detail-label">Order Total:</span>
                    <span class="detail-value">${order_total}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping:</span>
                    <span class="detail-value" style="color: #27ae60;">FREE</span>
                </div>
            </div>

            <div class="section">
                <h2>Items Ordered</h2>
                <p style="font-size: 14px; color: #333; line-height: 1.8;">${order_items}</p>
            </div>

            <div class="section">
                <h2>Shipping Address</h2>
                <p style="font-size: 14px; color: #333; line-height: 1.8;">${shipping_address}</p>
            </div>

            <div class="section" style="background: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 13px;">
                    Questions? Contact us at <a href="mailto:${contact_email}">${contact_email}</a>
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>DMILLION LUXURY FASHION</strong></p>
            <p style="margin-top: 10px;">© 2026 DMILLION. All rights reserved.</p>
            <p><a href="https://dmillionluxury.ca">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email with anti-spam headers
    const mailOptions = {
      from: `DMILLION <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Your DMILLION Order Confirmed - Tracking ${tracking_number}`,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'DMILLION Order System',
        'List-Unsubscribe': '<mailto:unsubscribe@dmillion.com>',
        'X-Campaign': 'order-confirmation',
      },
      text: `Dear ${customer_name},\n\nYour DMILLION order #${tracking_number} has been confirmed!\n\nTracking Number: ${tracking_number}\nOrder Total: ${order_total}\n\nShipping Address:\n${shipping_address}\n\nItems: ${order_items}\n\nThank you for choosing DMILLION Luxury Fashion!\n\nBest regards,\nDMILLION Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', { messageId: info.messageId, to });

    return res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Email error:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
