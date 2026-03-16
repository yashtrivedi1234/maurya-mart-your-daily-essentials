# Maurya Mart - Your Daily Essentials

Maurya Mart is a modern E-commerce platform designed to provide a seamless shopping experience for daily essentials, electronics, and fashion.

## 🚀 Features

- **Store Front**: Browse products by categories, featured items, and trending deals.
- **User Authentication**: Secure login/signup with OTP verification.
- **Admin Panel**: Effortlessly manage products, hero slides, and view orders.
- **Secure Payments**: Integrated with Razorpay for a smooth checkout experience.
- **Real-time Notifications**: Automated email receipts for customers and order alerts for the owner.
- **Cloud Image Storage**: Powered by Cloudinary for high-performance image delivery.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Redux Toolkit Query
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Image Storage**: Cloudinary
- **Payments**: Razorpay
- **Email**: Nodemailer (Gmail SMTP)

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Cloudinary account
- Razorpay account

### Backend Setup
1. Navigate to `Bankend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file with the following:
   ```env
   MONGO_URI=your_mongodb_uri
   PORT=5001
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@gmail.com
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start server: `npm start`.

### Frontend Setup
1. Navigate to `Frontend` directory.
2. Install dependencies: `npm install`.
3. Create `.env` from `.env.example` and set `VITE_API_BASE_URL`.
3. Start development server: `npm run dev`.

## Render Deployment

### 1. Deploy Backend (Web Service)
1. In Render dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repo and select the backend root directory: `Bankend`.
3. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add backend environment variables from `Bankend/.env.example`.
5. Set `CORS_ORIGINS` to include your frontend Render URL, for example:
   - `https://maurya-mart-frontend.onrender.com`

### 2. Deploy Frontend (Static Site)
1. In Render dashboard, click **New +** > **Static Site**.
2. Connect the same repo and select root directory: `Frontend`.
3. Use these settings:
   - Build Command: `npm install ; npm run build`
   - Publish Directory: `dist`
4. Add frontend environment variables:
   - `VITE_API_BASE_URL=https://your-backend-service.onrender.com`
   - `VITE_RAZORPAY_KEY_ID=your_razorpay_key`

### 3. Final Checklist
- Backend service is healthy on `/api` routes.
- Frontend env `VITE_API_BASE_URL` points to backend Render URL.
- Backend `CORS_ORIGINS` includes frontend Render URL.
- Cloudinary, MongoDB, Email, and Razorpay keys are set in backend env.

## 📄 License
This project is private and intended for Maurya Mart operations.
