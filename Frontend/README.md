# Inkwell — Blog Platform

## Project Structure

```
project-root/
├── backend/                    # Your existing backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── connect-DB.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── blogController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── Adminmiddle.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Blog.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── blogRoutes.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── frontend/                   # This folder
    ├── src/
    │   ├── api/
    │   │   └── index.js         # Axios instance + all API calls
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Navbar.css
    │   │   ├── BlogCard.jsx
    │   │   └── BlogCard.css
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx / Home.css
    │   │   ├── Login.jsx
    │   │   ├── SignUp.jsx
    │   │   ├── Auth.css         # Shared auth styles
    │   │   ├── Dashboard.jsx / Dashboard.css
    │   │   ├── CreateBlog.jsx / CreateBlog.css
    │   │   ├── Profile.jsx / Profile.css
    │   │   └── AdminPanel.jsx / AdminPanel.css
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup & Run

### 1. Backend Setup

Make sure your `.env` file has:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

**Add CORS to your backend `index.js`** — update the cors config:
```js
app.use(cors({
  origin: 'http://localhost:5173',   // frontend URL
  credentials: true,
}))
```

Run backend:
```bash
cd backend
npm install
npm run dev    # or: node src/index.js
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**
Backend runs at: **http://localhost:5000**

The Vite proxy in `vite.config.js` forwards all `/api` requests to port 5000 — so no CORS issues during development.

---

## Pages & Features

| Route        | Access       | Description                        |
|-------------|--------------|-------------------------------------|
| `/`          | Public       | Landing page                       |
| `/signup`    | Guest only   | Create account (user or admin)     |
| `/login`     | Guest only   | Sign in                            |
| `/dashboard` | Auth         | View & delete your blogs           |
| `/create`    | Auth         | Write & publish a new blog         |
| `/profile`   | Auth         | Edit name/email/password, delete account |
| `/admin`     | Admin only   | View & delete all users            |

---

## Notes

- Authentication uses **JWT** stored in both cookie and `localStorage`
- The frontend reads the token from `localStorage` and sends it as `Authorization: Bearer <token>`
- Blog images are uploaded to **Cloudinary** via `multipart/form-data`
- Admin panel is only visible and accessible to users with `role: 'admin'`
