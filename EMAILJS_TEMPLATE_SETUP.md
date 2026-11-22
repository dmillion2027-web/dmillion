# EmailJS Order Confirmation Template Setup

## Quick Setup (5 minutes)

### Step 1: Log In to EmailJS
1. Go to: https://www.emailjs.com/
2. Sign in with your account (use the email associated with your service_0dphftg)

### Step 2: Create New Template
1. Click **Email Templates** in the left menu
2. Click **Create New Template**
3. Name it: `Order Confirmation`

### Step 3: Copy Template Configuration

**Subject Line:**
```
Your DMILLION Order Confirmed - Tracking #{{tracking_number}}
```

**HTML Content (Copy entire section below):**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Playfair Display', serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e8d5b7; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1a1a1a; margin: 0; font-size: 32px; font-family: 'Playfair Display', serif; }
        .header p { color: #999; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 2px; }
        .content { padding: 20px 0; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 15px; line-height: 1.6; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1a1a1a; font-size: 18px; border-bottom: 1px solid #e8d5b7; padding-bottom: 10px; margin: 0 0 15px 0; font-family: 'Playfair Display', serif; }
        .tracking-box { background: linear-gradient(135deg, #e8d5b7 0%, #d4c1a3 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 15px 0; }
        .tracking-box p { margin: 0; color: #1a1a1a; font-weight: 600; }
        .tracking-box .number { font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 10px 0; }
        .tracking-box .subtitle { font-size: 12px; color: #555; margin-top: 10px; }
        .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8d5b7; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; }
        .detail-value { color: #1a1a1a; font-weight: 600; }
        .total-row { font-weight: bold; font-size: 18px; color: #1a1a1a; padding-top: 10px; border-top: 2px solid #e8d5b7; }
        .items-list { margin: 15px 0; padding: 15px; background: #fafafa; border-radius: 8px; border-left: 4px solid #e8d5b7; }
        .items-list p { margin: 8px 0; color: #333; font-size: 14px; line-height: 1.5; }
        .address-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; color: #333; font-size: 14px; line-height: 1.6; margin: 15px 0; }
        .next-steps { background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #e8d5b7; }
        .next-steps ul { margin: 10px 0; padding-left: 25px; color: #333; font-size: 14px; }
        .next-steps li { margin: 8px 0; line-height: 1.5; }
        .cta-button { display: inline-block; background: #1a1a1a; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 600; border: 2px solid #1a1a1a; }
        .cta-button:hover { background: #e8d5b7; color: #1a1a1a; }
        .footer { text-align: center; border-top: 2px solid #e8d5b7; padding-top: 20px; margin-top: 30px; color: #999; font-size: 12px; line-height: 1.6; }
        .footer a { color: #e8d5b7; text-decoration: none; }
        .footer-contact { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>DMILLION</h1>
            <p>LUXURY FASHION</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Greeting -->
            <p class="greeting">Hello <strong>{{customer_name}}</strong>,</p>
            <p class="greeting">Thank you for your purchase! Your order has been confirmed and is being prepared for shipment. 🎉 <strong>Let's go!</strong></p>

            <!-- Tracking Section -->
            <div class="section">
                <h2>🎯 Tracking Information</h2>
                <div class="tracking-box">
                    <p>YOUR TRACKING NUMBER</p>
                    <div class="number">{{tracking_number}}</div>
                    <p class="subtitle">Save this number to track your order anytime</p>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://dmillionluxury.vercel.app/track-order" class="cta-button">Track Your Order</a>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="section">
                <h2>📋 Order Summary</h2>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Subtotal:</span>
                        <span class="detail-value">{{order_total}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Shipping:</span>
                        <span class="detail-value" style="color: #27ae60;">FREE</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tax:</span>
                        <span class="detail-value">Included</span>
                    </div>
                    <div class="detail-row total-row">
                        <span>TOTAL AMOUNT:</span>
                        <span>{{order_total}}</span>
                    </div>
                </div>
            </div>

            <!-- Items -->
            <div class="section">
                <h2>🛍️ Items Ordered</h2>
                <div class="items-list">
                    <p>{{order_items}}</p>
                </div>
            </div>

            <!-- Shipping Address -->
            <div class="section">
                <h2>📦 Shipping Address</h2>
                <div class="address-box">
                    {{shipping_address}}
                </div>
            </div>

            <!-- What's Next -->
            <div class="section">
                <h2>⏭️ What's Next?</h2>
                <div class="next-steps">
                    <ul>
                        <li><strong>✓ Order Confirmed</strong> - Your order is in our system</li>
                        <li><strong>✓ Being Prepared</strong> - We're packing your luxury items</li>
                        <li><strong>✓ Shipping Soon</strong> - You'll get a shipping update</li>
                        <li><strong>✓ Track Anytime</strong> - Use your tracking number above</li>
                    </ul>
                </div>
            </div>

            <!-- Support -->
            <div class="section" style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <strong>Questions?</strong> Our luxury concierge is here to help!<br>
                    <a href="mailto:{{contact_email}}" style="color: #e8d5b7; text-decoration: none; font-weight: 600;">{{contact_email}}</a> | +1-800-DMILLION
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>DMILLION LUXURY FASHION</strong></p>
            <p class="footer-contact">
                <a href="https://dmillionluxury.vercel.app">www.dmillionluxury.com</a>
            </p>
            <p style="margin-top: 15px; border-top: 1px solid #e8d5b7; padding-top: 15px;">
                © 2026 DMILLION. All rights reserved.<br>
                Follow us on Instagram @dmillion_luxury
            </p>
        </div>
    </div>
</body>
</html>
```

### Step 4: Save and Get Template ID

1. Click **Save**
2. You'll see the template ID at the top - looks like: `template_abc123def456`
3. Copy this ID

### Step 5: Update .env File

Replace `VITE_EMAILJS_TEMPLATE_ID` in your `.env` file:

```
VITE_EMAILJS_SERVICE_ID=service_0dphftg
VITE_EMAILJS_TEMPLATE_ID=template_YOUR_NEW_ID_HERE
VITE_EMAILJS_PUBLIC_KEY=2CPqgqjZJeBh8LJ9L
```

### Step 6: Restart Dev Server

If running locally:
```bash
npm run dev
```

If deployed to Vercel:
1. Push changes to GitHub
2. Vercel auto-deploys in ~2 minutes

### Step 7: Test

1. Go to checkout: https://dmillionluxury.vercel.app/
2. Add items to cart
3. Complete checkout with any tracking number
4. Check your email (check spam folder too!)
5. You should receive the order confirmation email

---

## Template Variables Reference

These variables are auto-filled from checkout:

| Variable | From | Example |
|----------|------|---------|
| `{{customer_name}}` | Full Name | John Doe |
| `{{tracking_number}}` | Generated | DM1234567890 |
| `{{order_total}}` | Calculated | $299.99 |
| `{{order_items}}` | Cart Items | Luxury Handbag x1, Clutch x1 |
| `{{shipping_address}}` | Form | 123 Main St, Toronto, Canada |
| `{{contact_email}}` | Support | support@dmillion.com |

---

## Troubleshooting

### Email Not Sending?

**Check 1:** Template ID in .env
```
# Should look like:
VITE_EMAILJS_TEMPLATE_ID=template_abcdef123456
```

**Check 2:** Verify in EmailJS Dashboard
- Go to https://www.emailjs.com/
- Check Email Templates section
- Make sure template status is "Active"

**Check 3:** Browser Console
- Open browser dev tools (F12)
- Go to Console tab
- Look for any error messages during checkout
- Should see: "✅ Email notification sent"

**Check 4:** Test from EmailJS
- Go to EmailJS Template Editor
- Click "Test it"
- Check if test email arrives

### Common Issues

| Issue | Solution |
|-------|----------|
| Template not found | Copy-paste Template ID exactly |
| Variables show as {{var}} | Spelling must match exactly |
| Email in spam | Add dmillion@dmillion.com to contacts |
| No email at all | Check service_id and public_key |

---

## Customize the Email

Want to change colors? Find these in the HTML:

- **Gold Color:** `#e8d5b7` → Change to your color
- **Black Color:** `#1a1a1a` → Change to your color
- **Company Name:** "DMILLION" → Update everywhere
- **Support Email:** `{{contact_email}}` → Or hardcode

---

**Status:** Ready to set up! ✅
