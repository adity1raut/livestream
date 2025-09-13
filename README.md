# Livestream Social Platform

A full-stack social media web application with real-time chat, posts, notifications, and a gaming-inspired dark theme.

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
- Gaming-inspired dark theme UI
- Responsive design
- Store and product management (basic)
- Notification system for likes, comments, and follows

---

## Tech Stack

**Backend:**
- Node.js, Express.js
- MongoDB, Mongoose
- JWT Authentication
- Socket.io (real-time)
- Cloudinary (media uploads)
- Nodemailer (email)
- Multer (file uploads)

**Frontend:**
- React (with Vite)
- React Router
- Axios
- Tailwind CSS (gaming/dark theme)
- Lucide-react (icons)
- React Toastify (notifications)

---

## Project Structure

```
livestream/
│
├── backend/
│   ├── config/           # Cloudinary, multer, nodemailer configs
│   ├── controllers/      # Route controllers (Post, User, Chat, etc.)
│   ├── db/               # MongoDB connection
│   ├── mainRouter/       # Main API router
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose models (User, Post, etc.)
│   ├── route/            # Route definitions
│   ├── services/         # Notification service
│   ├── socket/           # Socket.io handlers
│   ├── uploads/          # Uploaded files
│   ├── utils/            # Utility functions
│   └── server.js         # Express server entry
│
├── client/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components (Post, Profile, Chat, etc.)
│   │   ├── context/      # React context providers (Auth, Notification)
│   │   ├── assets/       # Images, icons
│   │   ├── App.jsx       # Main app and routes
│   │   └── main.jsx      # React entry
│   ├── index.html
│   ├── vite.config.js    # Vite + proxy config
│   └── package.json
│
└── README.md             # Project documentation
```

---

## Backend Overview

- **Express.js** REST API with JWT authentication.
- **MongoDB** for data storage (users, posts, messages, notifications).
- **Socket.io** for real-time chat and notifications.
- **Cloudinary** for image/video uploads.
- **Mongoose models:** User, Post, Message, Notification, Store, etc.
- **API routes:** `/api/auth`, `/api/posts`, `/api/chat`, `/api/notifications`.

---

## Frontend Overview

- **React** SPA with protected/public routes.
- **Tailwind CSS** for a modern, gaming-inspired dark UI.
- **React Context** for authentication and notifications.
- **Post, Profile, Chat, Notification, Store** components.
- **Vite** for fast development and proxying API requests.

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for media uploads)

### 1. Clone the repository

```bash
git clone https://github.com/adity1raut/livestream.git
cd livestream
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create a .env file with your MongoDB URI, JWT secret, Cloudinary, and email configs
npm start
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

- The frontend will run on `http://localhost:5173` and proxy API requests to the backend.

---

## API Endpoints

### Auth & User

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/profile/:username` - Get user profile
- `POST /api/auth/profile/:username/follow` - Follow/unfollow user
- `GET /api/auth/profile/:username/followers` - List followers
- `GET /api/auth/profile/:username/following` - List following
- `GET /api/auth/profile/:username/posts` - User's posts
- `GET /api/auth/profile/me/posts` - Authenticated user's posts

### Posts

- `POST /api/posts/create` - Create post (image/video)
- `GET /api/posts/feed` - Get feed (paginated)
- `GET /api/posts/:postId` - Get single post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comment` - Add comment

### Chat & Notifications

- `GET /api/chat/...` - Chat endpoints
- `GET /api/notifications/...` - Notification endpoints

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

ISC © Aditya

---

