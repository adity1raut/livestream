# Livestream Social Platform

A full-stack social media and e-commerce platform inspired by gaming communities. Livestream enables users to share posts, chat in real time, join live streams, manage stores and products, and make secure payments—all in a modern, dark-themed UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Overview](#backend-overview)
- [Frontend Overview](#frontend-overview)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User authentication (signup, login, password reset)
- User profiles with followers/following
- Create, like, comment, and delete posts (with image/video upload)
- Real-time chat and notifications (Socket.io)
- Real-time live stream sharing and viewing with chat
- Arena events and matchmaking
- Gaming-inspired dark theme (Tailwind CSS)
- Responsive design for all devices
- Store and product management (add/edit/delete products, analytics)
- Wishlist, cart, and order management
- Payment integration (Razorpay/Stripe)
- Notification system for likes, comments, follows, purchases, and arena invites
- Lucide React icons for a modern, consistent UI

---

## Tech Stack

**Backend:**  
- Node.js, Express.js  
- MongoDB, Mongoose  
- JWT authentication  
- Socket.io (real-time chat, notifications, live stream events)  
- Cloudinary (media uploads)  
- Nodemailer (email)  
- Multer (file uploads)  
- Razorpay/Stripe (payments)

**Frontend:**  
- React (Vite)  
- React Router  
- Axios  
- Tailwind CSS  
- Lucide-react (icons)  
- React Toastify  
- Context API for state management

---

## Project Structure

```
livestream/
├── backend/      # Express API, MongoDB, Socket.io, Cloudinary, Payments, etc.
│   ├── config/   # Service configs (Cloudinary, Multer, Email, Payments)
│   ├── controllers/ # Route controllers (Chat, Notification, Post, Profile, Store, Stream, User)
│   ├── db/       # Database connection
│   ├── mainRouter/ # Main router
│   ├── middleware/ # Auth and store verification
│   ├── models/   # Mongoose models (User, Post, Store, Product, Order, etc.)
│   ├── route/    # Route definitions
│   ├── services/ # Notification and other services
│   ├── socket/   # Socket.io handlers
│   ├── uploads/  # Uploaded files
│   └── server.js # Entry point
├── client/       # React app, Tailwind CSS, context, components
│   ├── public/   # Static assets
│   ├── src/
│   │   ├── assets/      # Images and icons
│   │   ├── components/  # UI components (Posts, Chat, Store, Stream, etc.)
│   │   ├── context/     # Context providers (Auth, Store, Notification, Socket)
│   │   ├── Store/       # Store, product, cart, order, analytics, wishlist
│   │   ├── Stream/      # Live stream components
│   │   └── styles.css   # Custom styles
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/       # Streaming server config (e.g., NGINX RTMP)
│   └── stream.conf
└── README.md     # Project documentation
```

---

## Backend Overview

- **Express.js** REST API with JWT authentication.
- **MongoDB** for data storage (users, posts, messages, notifications, stores, products, orders, streams, arenas).
- **Socket.io** for real-time chat, notifications, live stream, and arena events.
- **Cloudinary** for image/video uploads.
- **Payment Integration** (Razorpay/Stripe) for secure store transactions.
- **Mongoose models:** User, Post, Message, Notification, Store, Product, Order, Stream, Arena, etc.
- **API routes:** `/api/auth`, `/api/posts`, `/api/chat`, `/api/notifications`, `/api/stores`, `/api/products`, `/api/payments`, `/api/livestream`, `/api/arena`.

---

## Frontend Overview

- **React** SPA with protected/public routes.
- **Tailwind CSS** for a modern, gaming-inspired dark UI.
- **React Context** for authentication, notifications, store, and arena management.
- **Post, Profile, Chat, Notification, Store, Product, Payment, Livestream, Arena** components.
- **Real-time chat** and **live stream sharing** using Socket.io.
- **Storefront** with product browsing, like, add to cart, checkout, wishlist, and order history.
- **Arena** for live events, matchmaking, and challenges.
- **Lucide React** for a consistent icon set across the UI.
- **Vite** for fast development and proxying API requests.

---

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay or Stripe account for payments

### 1. Clone the repository

```bash
git clone https://github.com/adity1raut/livestream.git
cd livestream
```

### 2. Backend Setup

```bash
cd backend
npm install
# Configure .env with MongoDB URI, JWT secret, Cloudinary, Razorpay/Stripe, email configs
npm start
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API requests to the backend.

---

## API Endpoints

- **Auth & User:** Signup, login, profile, follow, followers, following, user posts
- **Posts:** Create, feed, single post, like, comment, delete
- **Chat & Notifications:** Real-time chat and notification endpoints
- **Stores & Products:** Store listing, product management, like, add to cart, checkout, wishlist, order history
- **Payments:** Secure payment processing (Razorpay/Stripe)
- **Livestream:** Start, join, and share real-time live streams with chat
- **Arena:** Create/join arena events, matchmaking, challenges

---

## Contributing

Pull requests are welcome! For major changes, open an issue to discuss your ideas.

---

## License

ISC © Aditya

---