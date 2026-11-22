# DMILLION Luxury Bags - E-Commerce Website

A modern, luxury e-commerce website for DMILLION bags featuring 3D product visualization, real-time order tracking, and a seamless shopping experience.

![DMILLION Luxury Bags](https://img.shields.io/badge/Status-Complete-success)
![React](https://img.shields.io/badge/React-19.3.1-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.187.0-orange)

## ✨ Features

### 🎨 Interactive 3D Visualization
- **React Three Fiber** integration for stunning 3D bag models
- Interactive product viewer (drag to rotate, scroll to zoom)
- Real-time color customization
- Smooth animations with Framer Motion

### 🛍️ E-Commerce Functionality
- Product catalog with category filtering
- Shopping cart with persistent storage
- Add to cart, update quantities, remove items
- Promo code system
- Responsive product detail pages

### 📦 Order Management
- Real-time order tracking with Supabase
- Live status updates using WebSocket subscriptions
- Visual order timeline
- Email notifications (ready for integration)

### 🎯 User Experience
- Fully responsive design (mobile, tablet, desktop)
- Smooth page transitions and animations
- Newsletter subscription system
- Contact form with validation
- Search functionality (ready for implementation)

### 🔐 Backend Integration
- Supabase for database and real-time features
- Authentication ready (can be extended)
- Secure data handling
- Row Level Security policies

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Dmillions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Follow the instructions in `SUPABASE_SETUP.md` to:
   - Create the necessary tables
   - Set up real-time subscriptions
   - Configure Row Level Security
   - Add sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
Dmillions/
├── public/                  # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images and media
│   ├── components/         # React components
│   │   ├── 3d/            # Three.js 3D components
│   │   │   ├── BagModel.jsx
│   │   │   └── Scene.jsx
│   │   ├── sections/      # Page sections
│   │   │   ├── Hero.jsx
│   │   │   ├── Collection.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Features.jsx
│   │   │   └── Newsletter.jsx
│   │   └── ui/            # UI components
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── ProductCard.jsx
│   ├── context/           # React Context
│   │   └── CartContext.jsx
│   ├── lib/              # Library configurations
│   │   └── supabase.js
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── CollectionPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   └── TrackOrderPage.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── SUPABASE_SETUP.md     # Database setup guide
├── package.json
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── vite.config.js        # Vite configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 19.3.1** - UI framework
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animations and transitions
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### 3D Graphics
- **Three.js 0.187.0** - 3D rendering engine
- **React Three Fiber 9.8.2** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (ready to use)
  - Row Level Security

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📱 Pages

### Home Page (`/`)
- Hero section with 3D bag model
- Featured collection showcase
- About section
- Features highlights
- Newsletter subscription

### Collection Page (`/collection`)
- Product grid with filtering
- Category selection
- 3D product previews
- Add to cart functionality

### Product Detail Page (`/product/:id`)
- Interactive 3D model viewer
- Color customization
- Product details and specifications
- Quantity selector
- Add to cart, favorites, share
- Customer reviews section

### Shopping Cart (`/cart`)
- Cart items management
- Quantity updates
- Promo code application
- Order summary with tax calculation
- Proceed to checkout

### Order Tracking (`/track-order`)
- Real-time order status updates
- Visual timeline
- Order details and items
- Shipping information

### About Page (`/about`)
- Brand story and history
- Company timeline
- Achievements and statistics
- Core values

### Contact Page (`/contact`)
- Contact form with validation
- Company information
- Location map placeholder
- Support options

## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Fluid typography
- Flexible grid layouts

### Animations
- Page transitions with Framer Motion
- Scroll-triggered animations
- Hover effects and micro-interactions
- Loading states

### Color Scheme
- Primary: Black (#000000)
- Accent: Amber (#F59E0B)
- Neutral: Stone/Gray palette
- Consistent brand identity

## 🔒 Security

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Secure authentication patterns

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel, Netlify, or similar

1. Connect your repository
2. Set environment variables
3. Deploy with automatic builds

## 📊 Database Schema

See `SUPABASE_SETUP.md` for detailed schema information.

Main tables:
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `newsletter_subscribers` - Email subscribers
- `carts` - Persistent shopping carts (optional)

## 🎯 Future Enhancements

- [ ] User authentication and accounts
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Advanced search with filters
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Inventory management
- [ ] Multi-language support
- [ ] PWA features (offline mode)
- [ ] Analytics dashboard
- [ ] Email templates for order confirmations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary. All rights reserved.

## 🆘 Support

For support, email hello@dmillion.com or visit our support page.

## 👨‍💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Consistent naming conventions
- Component-based architecture

## 🙏 Acknowledgments

- Design inspired by luxury fashion e-commerce sites
- 3D models created with Three.js primitives
- Icons from Lucide React
- Fonts: Playfair Display (serif), Inter (sans-serif)

---

Built with ❤️ for DMILLION Luxury Bags
