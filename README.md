# IMY220-Project

# WOGGLE - DELIVERABLE 2

Woggle is a social media platform designed for Scouts to share adventures, camps, achievements and memories.

Users can create accounts, share posts, create albums, connect with other users through friend requests, comment on posts, and report posts.

---

## TECHNOLOGIES

### Frontend

* React
* Vite
* React Router
* Native Fetch API
* CSS / TailwindCSS styling

### Backend

* Node.js
* Express.js
* MongoDB
* MongoDB Node.js Driver
* Express Session
* CORS

### Containerisation

* Docker
* Docker Compose

---

## PROJECT STRUCTURE

```text
IMY220-Project/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend/
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── postRepository.js
│   │   ├── albumRepository.js
│   │   ├── commentRepository.js
│   │   └── reportRepository.js
│   ├── server.js
│   ├── db.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
└── README.md
```

---

# DATABASE

Woggle uses MongoDB to store application data.

The backend connects to MongoDB using the official `mongodb` Node.js package.

The database stores:

* Users
* Posts
* Albums
* Comments
* Reports

The MongoDB connection is configured using environment variables.

Example:

```text
MONGODB_URI=your_mongodb_connection_string
DB_NAME=Woggle
SESSION_SECRET=your_session_secret
PORT=5000
```

The `.env` file is not included in the GitHub repository.

---

# RUNNING THE PROJECT WITH DOCKER

Docker Compose is the recommended way to run Woggle.

From the project root:

```bash
docker compose up --build
```

This starts:

* Frontend on port `5173`
* Backend on port `5000`

To stop the containers:

```bash
docker compose down
```

---

# FRONTEND

The frontend runs at:

http://localhost:5173

The frontend is built using React and Vite.

It communicates with the Express backend using the native Fetch API.

---

# BACKEND

The backend runs at:

http://localhost:5000

The backend is built using Node.js and Express.js.

The backend provides REST API endpoints for authentication, users, friends, posts, albums, comments, reports and feeds.

---

# BACKEND HEALTH CHECK

The backend health endpoint can be accessed at:

http://localhost:5000/api/health

A successful response confirms that the Express server is running.

---

# API ROUTES

## Authentication

```text
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/logout
GET  /api/auth/me
```

These routes are used for creating an account, logging in, logging out and checking the currently logged-in user.

---

## Users

```text
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

Users can view users, view individual user information, edit their own information and delete their own account.

---

## User Posts

```text
GET /api/users/:id/posts
```

Returns posts created by a specific user.

---

## User Friends

```text
GET /api/users/:id/friends
GET /api/friends
```

These routes are used to retrieve friend information and the current user's friend requests.

---

## Friend Requests

```text
POST   /api/users/:id/friend-request
POST   /api/users/:id/accept
POST   /api/users/:id/decline
DELETE /api/users/:id/friend
```

These routes are used to:

* Send friend requests
* Accept friend requests
* Decline friend requests
* Remove/unfriend users

---

## Posts

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
```

Users can create, view, edit and delete posts.

Posts can contain:

* Title
* Description
* Hashtags
* Images
* Author information

---

## Comments

```text
GET  /api/posts/:id/comments
POST /api/posts/:id/comments
```

These routes are used to view and add comments to posts.

---

## Reports

```text
GET  /api/report-reasons
POST /api/posts/:id/reports
```

Users can report posts using the available report reasons.

---

## Albums

```text
GET    /api/albums
GET    /api/albums/:id
POST   /api/albums
PUT    /api/albums/:id
DELETE /api/albums/:id
```

Users can create, view, edit and delete albums.

Albums can contain multiple posts.

---

## Activity Feed

```text
GET /api/feed?scope=local&sort=newest
GET /api/feed?scope=global&sort=newest
```

The activity feed supports:

* Local feed
* Global feed
* Newest sorting
* Popular sorting

The local feed contains activity from the logged-in user and their friends.

The global feed contains activity from users across Woggle.

---

## Search

```text
GET /api/search?q=searchTerm
```

The search API can search for:

* Users
* Posts
* Albums
* Hashtags

---

# FRONTEND ROUTES

```text
/                    Splash / Login Page

/home                Home Feed

/users/:id           User Page

/post/:id            Post Page

/search              Search Page

/friends             Friends Page

/albums              Albums Page

/albums/:id          Album Page

/create-post         Create Post Page

/edit-profile        Edit User Page
```

---

# MAIN FEATURES

## Authentication

Users can:

* Create an account
* Log in
* Log out
* Remain authenticated using a server-side session
* View their own User information

## Users

Users can:

* View their own User page
* View other Users
* Edit their own information
* Delete their own account
* View posts created by a User

## Friends

Users can:

* Send friend requests
* Accept friend requests
* Decline friend requests
* Unfriend Users
* View their friends

Friend information for another User is only displayed when the appropriate friendship/privacy condition is met.

## Posts

Users can:

* Create posts
* View posts
* Edit their own posts
* Delete their own posts
* View post authors
* Add hashtags
* Comment on posts
* Report posts

## Albums

Users can:

* Create albums
* View albums
* Edit their own albums
* Delete their own albums
* View posts belonging to albums

## Activity Feeds

The Home page provides:

* Local activity feed
* Global activity feed
* Newest activity
* Popular activity

## Search

Users can search for:

* Users
* Posts
* Albums
* Hashtags

---

# DOCKER

The project contains separate Dockerfiles for the frontend and backend.

Docker Compose is used to run both services together.

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

# DEVELOPMENT WITHOUT DOCKER

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm start
```

The backend requires the MongoDB environment variables to be configured.

---

# DELIVERABLE 2 NOTES

Deliverable 2 replaces the dummy frontend data used during Deliverable 1 with data retrieved from MongoDB.

The application now uses:

* MongoDB for persistent data
* Express.js for API routes
* The MongoDB Node.js driver for database access
* Native Fetch API requests from React
* Server-side sessions for authentication
* Docker and Docker Compose for running the application

Data displayed by the frontend is retrieved through the backend API rather than being hardcoded into React components.

---

# GITHUB REPOSITORY

https://github.com/Shanna-R/IMY220-Project.git

---

# AUTHOR

Created by Shanna Reinecke