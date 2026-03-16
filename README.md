# 🛍️ MaurMart - Your Daily Essentials E-commerce Platform

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![License](https://img.shields.io/badge/license-private-red)

> A modern, full-stack e-commerce platform delivering daily essentials, electronics, and fashion items with secure payments, real-time notifications, and an intuitive admin dashboard.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛒 Customer Features
- **Browse Products**: Shop by categories with advanced filtering and search
- **Featured Collections**: Trending deals, new arrivals, and promotional items
- **Smart Cart**: Add/remove items, real-time cart updates, persistent storage
- **Wishlist**: Save favorite items for later purchase
- **User Authentication**: 
  - Secure signup with email verification
  - OTP-based login for enhanced security
  - Password reset functionality
- **Order Management**: Track orders, view order history, and cancel if needed
- **Product Details**: Rich product pages with reviews, ratings, and descriptions
- **Responsive Design**: Seamless experience across all devices

### 💳 Payment & Checkout
- **Razorpay Integration**: Secure payment gateway with multiple payment methods
- **Order Confirmation**: Automated email receipts with order details
- **Order Tracking**: Real-time status updates from pending to delivered

### 👨‍💼 Admin Dashboard
- **Product Management**: Create, edit, update, and delete products
- **Hero Slides**: Manage promotional banners and hero sections
- **Order Management**: View all orders, manage order status
- **User Management**: View all registered users and their activity
- **Analytics**: Order and sales insights

### 🔧 Technical Features
- **Cloud Image Storage**: High-performance image delivery via Cloudinary
- **Email Notifications**: Automated emails for orders, password resets, and verifications
- **JWT Authentication**: Secure token-based user authentication
- **Real-time Updates**: Redux-based state management with RTK Query for caching
- **Error Handling**: Comprehensive error handling and user feedback

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React** | UI library for building user interfaces |
| **TypeScript** | Type-safe JavaScript for better code quality |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **Vite** | Lightning-fast build tool and dev server |
| **Redux Toolkit** | State management with Query for API caching |
| **React Router** | Client-side routing |
| **Lucide Icons** | Beautiful icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for building APIs |
| **MongoDB** | NoSQL database with Mongoose ODM |
| **JWT** | Secure token-based authentication |
| **Nodemailer** | Email service for notifications |
| **Multer** | File upload middleware |
| **CORS** | Cross-origin request handling |

### External Services
| Service | Usage |
|---|---|
| **MongoDB Atlas** | Cloud database hosting |
| **Cloudinary** | Cloud image storage and optimization |
| **Razorpay** | Payment gateway |
| **Gmail SMTP** | Email delivery service |
| **Render** | Web hosting and deployment |

---

## 📁 Project Structure

```
maur-mart/
├── Backend/                          # Express.js API server
│   ├── config/                       # Database configuration
│   ├── controllers/                  # Route handlers
│   │   ├── auth.Controller.js        # Auth operations
│   │   ├── product.Controller.js     # Product management
│   │   ├── order.Controller.js       # Order management
│   │   ├── payment.Controller.js     # Payment operations
│   │   └── ...                       # Other controllers
│   ├── middleware/                   # Custom middleware
│   │   └── auth.Middleware.js        # JWT verification
│   ├── models/                       # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── ...                       # Other models
│   ├── routes/                       # API endpoints
│   ├── utils/                        # Helper functions
│   │   ├── cloudinary.js             # Image upload
│   │   └── send.Email.js             # Email service
│   ├── uploads/                      # Local file storage
│   ├── server.js                     # Express app setup
│   └── package.json                  # Dependencies
│
├── Frontend/                         # React + TypeScript app
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── admin/                # Admin components
│   │   │   └── shop/                 # Shop components
│   │   ├── pages/                    # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetails.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   └── ...
│   │   ├── store/                    # Redux store
│   │   │   ├── api/                  # RTK Query endpoints
│   │   │   └── slices/               # Redux slices
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities & helpers
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   ├── public/                       # Static assets
│   ├── vite.config.ts                # Vite configuration
│   └── package.json                  # Dependencies
│
└── README.md                         # This file
```

---

## 📦 Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v7 or higher)
- **MongoDB Atlas** account - [Create Free](https://www.mongodb.com/cloud/atlas)
- **Cloudinary** account - [Sign Up Free](https://cloudinary.com/)
- **Razorpay** account - [Sign Up Free](https://razorpay.com/)
- **Gmail Account** with App Password for Nodemailer

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with your configuration:
   ```env
   # Server
   PORT=5001
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/maur-mart

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Admin Credentials
   ADMIN_EMAIL=admin@maur-mart.com
   ADMIN_PASSWORD=secure_admin_password_change_this

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_app_specific_password

   # Razorpay Keys
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # CORS
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5001`

### Frontend Setup

1. **Navigate to Frontend directory** (from root)
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   App will open at `http://localhost:5173`

---

## ⚙️ Configuration

### Email Setup (Gmail with App Password)

1. Enable 2-factor authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password for "Mail" and "Windows"
4. Use this password as `EMAIL_PASS` in your `.env`

### Razorpay Setup

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings > API Keys
3. Copy your Key ID and Key Secret
4. Add them to your `.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard and copy your Cloud Name, API Key, and API Secret
3. Add them to your `.env`

---

## 🚀 Usage

### Starting Development Environment

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Building for Production

**Frontend Production Build:**
```bash
cd Frontend
npm run build
npm run preview  # Preview production build locally
```

**Backend is ready for deployment as-is**

### Testing Admin Panel

1. Navigate to admin login
2. Email: `admin@maurmart.com` (or your `ADMIN_EMAIL`)
3. Password: Set in your `ADMIN_PASSWORD` env variable
4. Login via email + password (no OTP for admin)

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile (Protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Order Endpoints
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get order details (Protected)

### Payment Endpoints
- `POST /api/payments/create` - Create payment (Protected)
- `POST /api/payments/verify` - Verify payment (Protected)

---

## 🌐 Deployment

### Deploy to Render

#### Step 1: Deploy Backend (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `maurmart-backend`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add all environment variables from your `.env` file
6. Update `CORS_ORIGINS` to include your frontend URL:
   ```
   https://your-frontend-domain.onrender.com
   ```
7. Click **Create Web Service**

#### Step 2: Deploy Frontend (Static Site)

1. Click **New +** → **Static Site**
2. Connect the same repository
3. Configure:
   - **Name**: `maur-mart-frontend`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-service.onrender.com
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```
5. Click **Create Static Site**

#### Step 3: Verification

After deployment, verify everything works:

- ✅ Backend health check: `https://your-backend.onrender.com/api/auth/profile`
- ✅ Frontend loads: `https://your-frontend.onrender.com`
- ✅ Login works end-to-end
- ✅ Products load from backend
- ✅ Payment flow completes

---

## 🔧 Troubleshooting

### Backend Issues

**"MongoDB Connection Failed"**
- Check your `MONGO_URI` is correct
- Ensure IP whitelist includes Render's IP on MongoDB Atlas
- Verify username and password

**"Email not sending"**
- Verify Gmail App Password is correct
- Ensure 2FA is enabled on Gmail
- Check `EMAIL_USER` matches your Gmail

**"CORS error"**
- Add frontend URL to `CORS_ORIGINS` in backend `.env`
- Restart backend after changing `.env`

### Frontend Issues

**"API requests failing"**
- Verify `VITE_API_BASE_URL` points to correct backend
- Check backend is running and accessible
- Look for CORS errors in browser console

**"Login not persisting"**
- Check localStorage is enabled in browser
- Verify token is being set after successful OTP verification
- Check browser DevTools → Application → LocalStorage

**"Images not loading"**
- Verify Cloudinary credentials are correct
- Check internet connection
- Ensure image URLs are accessible

---

## 🤝 Contributing

This is a private project for Maur Mart. For contributions or issues:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request with detailed description

---

## 📄 License

This project is **private** and proprietary to Maur Mart. All rights reserved.

Unauthorized copying, modification, or distribution of this project is prohibited.

---

## 📧 Support

For questions or issues, please open an issue in the repository or contact the development team.

---

**Made with ❤️ for MauryMart**
