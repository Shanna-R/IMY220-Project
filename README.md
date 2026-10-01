# Woggle – Photo Sharing Website

**IMY 220 – Deliverable 2**
**Project:** Woggle
**Theme:** Where Scouting Meets Modern Adventure

---

## 1. Project Description

Woggle is a photo-sharing website designed around the Scouting and adventure community.

Users can:

* Create an account and log in
* Edit and delete their own User account
* View other Users
* Send, accept, decline and remove friends
* Create, edit and delete posts
* Like posts
* Comment on posts
* Create, edit and delete albums
* View posts and albums
* Search for Users and content
* View local and global activity feeds
* Report posts and Users
* Log out securely

Administrators have additional controls for managing Users, posts, activity and submitted reports.

The application uses:

* React
* Vite
* TailwindCSS
* Express.js
* Node.js
* MongoDB
* MongoDB Atlas
* Native Fetch API
* Docker and Docker Compose

---

# 2. Project Structure

```text
IMY220-Project/
│
├── backend/
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── postRepository.js
│   │   ├── albumRepository.js
│   │   ├── commentRepository.js
│   │   ├── reportRepository.js
│   │   └── reportReasonRepository.js
│   │
│   ├── db.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
└── README.md
```

---

# 3. Technologies Used

## Frontend

* React
* Vite
* React Router
* TailwindCSS
* Native Fetch API
* JavaScript / JSX

## Backend

* Node.js
* Express.js
* MongoDB
* MongoDB Node.js driver
* Express Session
* CORS
* dotenv

## Development / Deployment

* Docker
* Docker Compose
* MongoDB Atlas
* GitHub

---

# 4. MongoDB Database

The application uses MongoDB to store all persistent application data.

The main collections are:

```text
users
posts
albums
comments
reports
reportReasons
```

## Users

Stores account information such as:

* User ID
* Name
* Username
* Email
* Password
* Bio
* Location
* Profile image
* Friends
* Friend requests
* Admin status
* Account creation date

## Posts

Stores:

* Post ID
* Author ID
* Description
* Image
* Hashtags
* Likes
* Creation date

## Albums

Stores:

* Album ID
* Owner ID
* Album name
* Description
* Post IDs
* Creation date

## Comments

Stores:

* Comment ID
* Post ID
* User ID
* Comment text
* Creation date

## Reports

Stores actual reports submitted by Users.

A report contains:

```text
_id
reporterId
targetType
targetId
reason
createdAt
```

`targetType` can be:

```text
post
user
```

## Report Reasons

Stores the available reasons that Users can select when reporting content.

Administrators can add new report reasons.

---

# 5. Authentication

The application uses Express sessions for authentication.

Available authentication endpoints:

```text
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/logout
GET  /api/auth/me
```

Users are redirected according to their account type.

Normal Users are sent to:

```text
/home
```

Administrators are sent to:

```text
/admin
```

---

# 6. User API

The application provides API routes for managing Users.

```text
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/posts
GET    /api/users/:id/friends
```

Users can:

* View their own information
* Edit their own information
* Delete their own account
* View other Users
* View another User's posts
* View friends

---

# 7. Friend System

The application supports:

* Sending friend requests
* Accepting friend requests
* Declining friend requests
* Removing friends
* Viewing friends

API routes:

```text
GET    /api/friends
POST   /api/users/:id/friend-request
POST   /api/users/:id/accept
POST   /api/users/:id/decline
DELETE /api/users/:id/friend
```

Friend information is stored in the User documents in MongoDB.

---

# 8. Posts

Users can create and manage their own posts.

API routes:

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
```

A post can contain:

* Description
* Image
* Hashtags
* Author
* Likes
* Creation date

Users can edit and delete their own posts.

Administrators can also edit and delete posts.

---

# 9. Comments

Users can view and create comments on posts.

API routes:

```text
GET  /api/posts/:id/comments
POST /api/posts/:id/comments
```

Comments are stored in MongoDB and linked to their corresponding post and User.

---

# 10. Albums

Users can create and manage albums.

API routes:

```text
GET    /api/albums
GET    /api/albums/:id
POST   /api/albums
PUT    /api/albums/:id
DELETE /api/albums/:id
```

Albums contain posts created by Users.

Users can:

* Create albums
* View albums
* Edit their albums
* Delete their albums

---

# 11. Activity Feeds

Woggle provides local and global activity feeds.

The feed endpoint is:

```text
GET /api/feed
```

The feed supports:

```text
scope=local
scope=global
```

and sorting:

```text
sort=newest
sort=popular
```

Examples:

```text
/api/feed?scope=local&sort=newest
```

```text
/api/feed?scope=global&sort=popular
```

The frontend uses the Native Fetch API to retrieve the feed data from the Express backend.

---

# 12. Search

Users can search for content using:

```text
GET /api/search?q=...
```

Search functionality can be used to find relevant Users and content.

---

# 13. Reporting System

Users can report:

* Posts
* Other Users

Report routes:

```text
POST /api/posts/:id/reports
POST /api/users/:id/reports
```

A report contains:

```text
reporterId
targetType
targetId
reason
createdAt
```

Users cannot report their own posts or their own User account.

Duplicate reports from the same User for the same target are also checked.

---

# 14. Report Reasons

Report reasons are stored separately from submitted reports.

The database contains a:

```text
reportReasons
```

collection.

Default reasons include:

```text
Spam
Harassment
Inappropriate content
False information
Copyright violation
Other
```

Administrators can add additional reasons.

Admin report-reason endpoints:

```text
GET    /api/admin/report-reasons
POST   /api/admin/report-reasons
DELETE /api/admin/report-reasons/:id
```

This means that report reasons are stored persistently in MongoDB rather than being permanently hard-coded into the frontend.

---

# 15. Admin Functionality

Administrators have access to the Admin page.

The Admin system allows administrators to manage:

* Users
* Posts
* Activity
* Submitted reports
* Report reasons

## Admin Users

Administrators can:

```text
View Users
Edit Users
Delete Users
```

API routes:

```text
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
```

---

## Admin Posts

Administrators can:

```text
View Posts
Edit Posts
Delete Posts
```

API routes:

```text
GET    /api/admin/posts
PUT    /api/admin/posts/:id
DELETE /api/admin/posts/:id
```

---

## Admin Activity

Administrators can remove activity when required.

```text
DELETE /api/admin/activity/:id
```

---

## Admin Reports

Administrators can view reports submitted by Users.

```text
GET /api/admin/reports
```

The Admin Reports section displays information such as:

* Report type
* Reporter
* Report reason
* Reported post/User
* Date of report

Only authenticated administrators can access the Admin API.

---

# 16. Admin Authentication

Admin routes are protected using an administrator middleware.

The backend checks:

1. Whether the User is logged in
2. Whether the logged-in User has administrator privileges

Non-administrators receive an authorization error when attempting to access Admin routes.

The Admin account used for testing is:

```text
Email: admin@example.com
Password: 12345678
```

---

# 17. Frontend Pages

The React frontend contains pages for the main application functionality.

Main areas include:

```text
Home
Explore
Albums
Friends
Users
Notifications
Post
Login
Signup
Admin
```

React Router is used to navigate between pages without requiring a full browser page reload.

---

# 18. API Communication

The frontend communicates with the Express backend using the Native Fetch API.

Example:

```javascript
const response = await fetch('/api/posts', {
    credentials: 'include'
});

const data = await response.json();
```

For requests that modify data, the appropriate HTTP method is used.

Examples:

```text
GET     Retrieve data
POST    Create data
PUT     Update data
DELETE  Remove data
```

Session credentials are included where authentication is required.

---

# 19. React State

React hooks are used throughout the frontend.

Common hooks include:

```javascript
useState()
useEffect()
```

`useState()` is used for information that can change while the application is running.

Examples:

* Posts
* Users
* Loading states
* Error messages
* Form values
* Reports

`useEffect()` is used for actions that should happen when a page or component loads.

For example:

```javascript
useEffect(() => {
    loadPosts();
}, []);
```

---

# 20. TailwindCSS / Website Theme

The Woggle website uses a Scouting/adventure-inspired visual theme.

Main colours include:

```text
Purple:  #4b2e83
Purple:  #5e3a9e
Gold:    #d4a537
Cream:   #f7f4ec
Charcoal:#2b2b2b
```

Additional theme colours include:

```text
Purple Light: #7c52c4
Cream Dark:   #efe9db
```

The theme is applied consistently across:

* Navigation
* Buttons
* Cards
* Forms
* Posts
* User pages
* Albums
* Admin pages
* Notifications
* Feed pages

The design uses custom styling rather than relying on default browser fonts and styling.

---

# 21. Docker

The application is designed to run using Docker and Docker Compose.

There are separate containers for:

```text
Frontend
Backend
```

MongoDB is accessed through the configured MongoDB connection.

The project contains:

```text
frontend/Dockerfile
backend/Dockerfile
docker-compose.yml
```

---

# 22. Running the Project

From the project root:

```bash
docker compose up --build
```

The frontend is available at:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

To stop the containers:

```text
Ctrl + C
```

---

# 23. Seeding the Database

The database can be seeded using:

```bash
docker compose run --rm backend node seed.js
```

The seed script creates the required initial data.

The seeded database contains:

* Multiple Users
* Posts
* Albums
* Comments
* Reports
* Report reasons
* An Admin account

The seed script clears the relevant collections before inserting the seed data.

---

# 24. Docker Rebuild

If backend code has changed, rebuild the backend with:

```bash
docker compose build backend
```

Then start the project:

```bash
docker compose up
```

If Docker appears to be using an old version of the backend, a complete rebuild can be performed with:

```bash
docker compose build --no-cache backend
```

---

# 25. Testing the Application

The following functionality should be tested before submission.

## Authentication

* [ ] Signup
* [ ] Login
* [ ] Logout
* [ ] Invalid login
* [ ] Admin login
* [ ] Admin protection

## Users

* [ ] View own User information
* [ ] Edit own User information
* [ ] Delete own User account
* [ ] View other Users
* [ ] View another User's posts

## Friends

* [ ] Send friend request
* [ ] Accept friend request
* [ ] Decline friend request
* [ ] Remove friend
* [ ] View friends

## Posts

* [ ] Create post
* [ ] View post
* [ ] Edit own post
* [ ] Delete own post
* [ ] Like post
* [ ] Comment on post

## Albums

* [ ] Create album
* [ ] View album
* [ ] Edit album
* [ ] Delete album

## Reports

* [ ] Report another User
* [ ] Report another User's post
* [ ] Prevent reporting own post
* [ ] Prevent reporting own User account
* [ ] Check report appears in MongoDB
* [ ] Check report appears in Admin Reports

## Admin

* [ ] View Users
* [ ] Edit Users
* [ ] Delete Users
* [ ] View posts
* [ ] Edit posts
* [ ] Delete posts
* [ ] Delete activity
* [ ] View submitted reports
* [ ] Add report reason
* [ ] Delete report reason

## Feed

* [ ] Local feed
* [ ] Global feed
* [ ] Newest sorting
* [ ] Popular sorting

---

# 26. Seeded Admin Account

For demonstration purposes:

```text
Email: admin@example.com
Password: 12345678
```

The Admin account has:

```text
isAdmin: true
```

This allows the Admin Protected Route and backend Admin middleware to identify the account as an administrator.

---

# 27. MongoDB Data Relationships

The main relationships between collections are:

```text
User
 │
 ├── creates → Posts
 │
 ├── creates → Albums
 │
 ├── creates → Comments
 │
 ├── has → Friends
 │
 └── submits → Reports
                 │
                 ├── targets → Post
                 └── targets → User


Album
 │
 └── contains → Posts


Post
 │
 ├── has → Comments
 ├── receives → Likes
 └── can be → Reported


ReportReason
 │
 └── provides → available reporting choices
```

---

# 28. Security / Access Control

Protected actions require authentication.

The backend uses:

```text
requireLogin
```

for normal authenticated actions.

Administrator actions use:

```text
requireAdmin
```

This prevents normal Users from accessing Admin functionality.

Passwords are not returned as part of safe User data responses.

---

# 29. Deliverable 2 Requirements

The implementation addresses the main D2 requirements:

### MongoDB / API

* MongoDB data is retrieved through the backend.
* The `mongodb` package is used.
* Data is stored in MongoDB rather than being hard-coded into React components.
* Express.js provides the API.
* Frontend and backend are separated into their own folders.

### Authentication

* Login
* Signup
* Logout

### Users

* View own User
* Edit own User
* View other Users
* Delete own User

### Friends

* Friend requests
* Accept/decline requests
* Unfriend functionality

### Posts

* Create
* Edit
* Delete
* Like
* Comment

### Albums

* Create
* Edit
* Delete
* View

### Reports

* Report posts
* Report Users
* Admin views reports
* Admin manages report reasons

### Admin

* Edit Users
* Delete Users
* Edit posts
* Delete posts
* Delete activity
* Manage submitted reports
* Add report reasons

### Frontend

* React
* Native Fetch API
* React state
* Async API requests
* TailwindCSS/theme styling

### Deployment

* Dockerfile for frontend
* Dockerfile for backend
* Docker Compose
* Docker-based demonstration

---

# 30. Conclusion

Woggle is a full-stack photo-sharing application built for the IMY 220 Deliverable 2 requirements.

The project combines a React frontend with an Express.js backend and MongoDB database. The application provides authentication, User management, friendships, posts, albums, comments, activity feeds, reporting and administrative functionality.

The application is containerised using Docker and Docker Compose so that the frontend and backend can be run consistently for demonstration and submission.