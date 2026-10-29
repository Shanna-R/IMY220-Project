# Woggle – Photo Sharing Website

**Module:** IMY 220
**Project:** Woggle
**Theme:** Where Scouting Meets Modern Adventure

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [Project Structure](#3-project-structure)
4. [Running the Application with Docker](#4-running-the-application-with-docker)
5. [Environment Variables](#5-environment-variables)
6. [Database Seeding](#6-database-seeding)
7. [Demonstration Accounts and Test Data](#7-demonstration-accounts-and-test-data)
8. [Database](#8-database)
9. [Authentication and User Roles](#9-authentication-and-user-roles)
10. [User Profiles and Friends](#10-user-profiles-and-friends)
11. [Posts and Comments](#11-posts-and-comments)
12. [Albums](#12-albums)
13. [Activity Feeds](#13-activity-feeds)
14. [Search](#14-search)
15. [Reporting and Moderation](#15-reporting-and-moderation)
16. [Notifications](#16-notifications)
17. [Account Verification](#17-account-verification)
18. [Administration](#18-administration)
19. [Frontend Pages](#19-frontend-pages)
20. [Website Design](#20-website-design)
21. [Docker Rebuild and Troubleshooting](#21-docker-rebuild-and-troubleshooting)
22. [Testing Checklist](#22-testing-checklist)

---

## 1. Project Overview

Woggle is a full-stack photo-sharing website inspired by the Scouting and outdoor adventure community. Members share camps, hikes, badges and adventures, organise their posts into albums, connect with friends and explore community activity. Administrators moderate content and manage accounts.

### Main Features

- Splash page for logged-out visitors with log in and sign-up forms and scrolling effects
- Registration (with automatic login), login, logout and account management
- Profiles with profile images (including drag-and-drop upload), biography and location
- Friend requests, friend lists and friendship-based profile visibility
- Image posts with descriptions, hashtags, likes and comments
- Albums for organising posts, with hashtag recommendations
- Local and global activity feeds with newest and popular sorting
- Search for users, posts, albums and hashtags, with spelling tolerance and autocomplete
- Favourite users, whose posts appear at the top of the feed
- Post and user reporting with predefined reasons; posts reported more than twice are hidden
- Notifications when an administrator removes a post
- Account verification requests and verified badges
- Administrator tools for users, posts, albums, reports, report reasons and verification
- Light and dark themes

---

## 2. Technologies Used

### Frontend

- React
- Vite
- JavaScript and JSX
- React Router
- Tailwind CSS and custom CSS
- Native Fetch API

### Backend

- Node.js
- Express.js
- MongoDB and the MongoDB Node.js driver
- MongoDB Atlas
- express-session
- CORS
- dotenv

### Development and Deployment

- Docker and Docker Compose
- Git and GitHub

---

## 3. Project Structure

```text
IMY220-Project/
│
├── backend/
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── postRepository.js
│   │   ├── albumRepository.js
│   │   ├── commentRepository.js
│   │   └── reportRepository.js
│   │
│   ├── db.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
└── README.md
```

The frontend and backend are separated. The frontend has a single `index.html`; every page is a React component in `src/pages`, built from reusable components in `src/components`. Database access for the main collections is organised into repository functions.

---

## 4. Running the Application with Docker

**Requirements:** Docker Desktop (or Docker Engine with the Compose plugin) and Git.

```bash
# 1. Clone the repository
git clone https://github.com/Shanna-R/IMY220-Project.git
cd IMY220-Project

# 2. Create the backend environment file, then fill in your values (see section 5)
cp backend/.env.example backend/.env

# 3. Build and start both containers
docker compose up --build

# 4. In a second terminal, seed the database (see section 6)
docker compose run --rm backend node seed.js
```

When the containers are running:

| Service  | URL                     |
| -------- | ----------------------- |
| Frontend | `http://localhost:5173` |
| Backend  | `http://localhost:5000` |

The frontend proxies every `/api` request to the backend container, so only the frontend URL is needed in the browser.

To stop the application press `Ctrl + C`, or run:

```bash
docker compose down
```

---

## 5. Environment Variables

The backend reads its configuration from `backend/.env`, which `docker-compose.yml` loads into the backend container. A template is provided in `backend/.env.example`.

```text
MONGODB_URI=<your MongoDB connection string>
DB_NAME=<your database name>
SESSION_SECRET=<a long random string>
PORT=5000
```

`.env` must not be committed to GitHub. If you use MongoDB Atlas, make sure your IP address is allowed in the cluster's network access settings.

---

## 6. Database Seeding

```bash
docker compose run --rm backend node seed.js
```

The seed script **deletes** the existing users, posts, albums, comments and reports in the configured database, then inserts fresh demonstration data. Check that `DB_NAME` points to the intended database before running it. Running it again resets the data to a known state.

**Report reasons are not seeded.** They are stored in their own `reportReasons` collection, which the seed script leaves untouched. After seeding a new database, log in as the administrator and add the reasons you want under **Report Reasons** in the admin area (for example Spam, Harassment, Inappropriate content, False information, Copyright violation and Other). Members cannot report a post until at least one reason exists.

---

## 7. Demonstration Accounts and Test Data

| Role   | Email               | Password   |
| ------ | ------------------- | ---------- |
| Member (test account) | `test@test.com`     | `test1234` |
| Administrator         | `admin@example.com` | `12345678` |

Other seeded members are listed in `backend/seed.js` (for example `livia@example.com` / `livia123`).

The seeded database contains:

- 8 registered members plus the administrator
- 10 posts with descriptions and hashtags
- 5 albums
- Comments and sample reports

The test account has posts, albums and two friends. Administrators are redirected to `/admin` after logging in; members are sent to `/home`.

---

## 8. Database

Woggle stores all persistent data in MongoDB. The backend connects through `backend/db.js`.

| Collection      | Purpose |
| --------------- | ------- |
| `users`         | Account details, profile information, friends, friend requests, favourites, admin status and verification status |
| `posts`         | Images, titles, descriptions, hashtags, likes and authors |
| `albums`        | Album details, hashtags and the IDs of the posts they contain |
| `comments`      | Comments linked to a post and a user |
| `reports`       | Reports submitted by users (`reporterId`, `targetType`, `targetId`, `reason`, `createdAt`) |
| `reportReasons` | Predefined reasons users can pick when reporting |
| `notifications` | Alerts for a user (`userId`, `type`, `message`, `read`, `createdAt`) |

### Verification fields on users

```text
verified                  boolean
verificationStatus        'none' | 'pending' | 'approved' | 'rejected'
verificationRequestedAt   date
```

### Relationships

```text
User ── creates ──► Posts, Albums, Comments
User ── has ──────► Friends, Favourites, Notifications
User ── submits ──► Reports ──► target a Post or a User
Album ── contains ► Posts (by ID; a post can be in several albums)
Post ── has ──────► Comments, Likes
```

An exported copy of the database is included with the project submission.

---

## 9. Authentication and User Roles

Woggle uses Express sessions (cookie based) to keep users logged in.

| Method | Endpoint           | Purpose                           |
| ------ | ------------------ | --------------------------------- |
| POST   | `/api/auth/signup` | Register (logs the user in)       |
| POST   | `/api/auth/signin` | Log in                            |
| POST   | `/api/auth/logout` | Log out                           |
| GET    | `/api/auth/me`     | Retrieve the current session user |

- **Members** manage their profile, create content and interact with other users.
- **Administrators** have additional controls, available only to accounts with `isAdmin: true`.

Member routes are protected by `requireLogin` and administrator routes by `requireAdmin`. On the frontend, `ProtectedRoute` and `AdminProtectedRoute` guard the pages. Logged-out visitors can only see the splash page. Passwords are never returned in API responses.

---

## 10. User Profiles and Friends

Members can view and edit their name, username, biography, location and profile image, view their own posts, albums and friends, and delete their account. What another member sees depends on friendship:

- **Not friends:** name and profile picture only
- **Friends:** the complete profile, including posts and friend list (read-only)

### User API

| Method | Endpoint                 | Purpose                 |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/users`             | Retrieve users          |
| GET    | `/api/users/:id`         | Retrieve a profile      |
| PUT    | `/api/users/:id`         | Update own profile      |
| DELETE | `/api/users/:id`         | Delete own account      |
| GET    | `/api/users/:id/posts`   | Retrieve a user's posts |
| GET    | `/api/users/:id/friends` | Retrieve a user's friends |

### Friend API

| Method | Endpoint                        | Purpose                |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/api/friends`                  | Friends and requests   |
| POST   | `/api/users/:id/friend-request` | Send a request         |
| POST   | `/api/users/:id/accept`         | Accept a request       |
| POST   | `/api/users/:id/decline`        | Decline a request      |
| DELETE | `/api/users/:id/friend`         | Remove a friend        |

A friendship exists only after the request is accepted. The local feed uses friendships to decide whose activity to show.

---

## 11. Posts and Comments

A post has an image, a title, a description, hashtags and an automatically generated creation date. Images can be added by file selection or drag and drop. Owners can edit the description and hashtags (the image cannot be changed), and delete their posts.

Other features:

- Like posts
- Comment on posts from the post page
- Favourite other users so their posts appear first in the feed
- Report posts belonging to other users
- The post page lists the album(s) the post belongs to, with links
- Deleting a post also deletes its comments and reports, and removes it from every album. If it was the only post in an album, that album is deleted too

### Post API

| Method | Endpoint                    | Purpose                               |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/api/posts`                | Retrieve posts                        |
| GET    | `/api/posts/:id`            | Retrieve a post                       |
| POST   | `/api/posts`                | Create a post                         |
| PUT    | `/api/posts/:id`            | Edit own post                         |
| DELETE | `/api/posts/:id`            | Delete own post                       |
| POST   | `/api/posts/:id/like`       | Like a post                           |
| POST   | `/api/posts/:id/favourite`  | Favourite a post's author             |
| DELETE | `/api/posts/:id/favourite`  | Remove the favourite                  |
| GET    | `/api/posts/:id/albums`     | Albums that contain the post          |
| POST   | `/api/posts/:id/reports`    | Report a post                         |
| GET    | `/api/hidden-posts`         | Hidden (heavily reported) posts       |

### Comment API

| Method | Endpoint                          | Purpose              |
| ------ | --------------------------------- | -------------------- |
| GET    | `/api/posts/:id/comments`         | Retrieve comments    |
| POST   | `/api/posts/:id/comments`         | Add a comment        |
| GET    | `/api/posts/:id/comments/count`   | Comment count        |
| DELETE | `/api/comments/:id`               | Delete a comment     |

---

## 12. Albums

Albums are collections of posts. Members can create albums with a name, description and hashtags, edit them, add and remove posts, and delete them. Deleting an album does not delete its posts.

**Hashtag recommendations:** when creating or editing an album, the member's most frequently used post hashtags are suggested and can be added with one click. Tags already entered are not suggested again.

### Album API

| Method | Endpoint                          | Purpose                                  |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/api/albums`                     | Retrieve albums                          |
| GET    | `/api/albums/hashtag-suggestions` | Most-used hashtags from the member's posts |
| GET    | `/api/albums/:id`                 | Retrieve an album                        |
| POST   | `/api/albums`                     | Create an album                          |
| PUT    | `/api/albums/:id`                 | Update own album                         |
| DELETE | `/api/albums/:id`                 | Delete own album                         |
| POST   | `/api/albums/:id/posts/:postId`   | Add a post to an album                   |
| DELETE | `/api/albums/:id/posts/:postId`   | Remove a post from an album              |

---

## 13. Activity Feeds

- **Local feed:** activity from the member and their friends
- **Global feed:** activity from all members

The feed contains posts and albums, newest first by default. Posts from favourited users appear at the top. The home page also shows trending hashtags. Posts hidden by reports are excluded.

```text
GET /api/feed?scope=local&sort=newest
GET /api/feed?scope=global&sort=popular
```

| Parameter | Values                | Meaning                                    |
| --------- | --------------------- | ------------------------------------------ |
| `scope`   | `local`, `global`     | Friends only, or everyone                  |
| `sort`    | `newest`, `popular`   | Reverse chronological, or most liked first |

---

## 14. Search

```text
GET /api/search?q=...
```

Members can search for:

- Users by name, username or email
- Posts by description and hashtags
- Albums by name, description and hashtags

Results link to the matching profile, post or album. Clicking a hashtag runs the same search as typing it. The search tolerates incomplete terms and spelling mistakes (Levenshtein distance matching), and the search box offers autocomplete suggestions.

---

## 15. Reporting and Moderation

Members can report other members' posts and other members. Each report uses a predefined reason chosen from a list. Members cannot report their own posts or account, and duplicate reports from the same member for the same target are rejected.

```text
POST /api/posts/:id/reports
POST /api/users/:id/reports
GET  /api/report-reasons
```

Posts reported **more than twice** (three or more reports) are hidden from feeds, search and albums. Members can see hidden posts through the Hidden Posts page.

Administrators manage the available reasons:

```text
GET    /api/admin/report-reasons
POST   /api/admin/report-reasons
DELETE /api/admin/report-reasons/:id
```

Report reasons are not part of the seed data. Administrators add them from the **Report Reasons** section of the admin area, and members can only report content once at least one reason exists.

---

## 16. Notifications

Members receive an alert, shown by a bell icon in the header with an unread count, when:

- An administrator deletes one of their posts
- A verification request is approved or rejected

Notifications can be marked as read and dismissed.

```text
GET    /api/notifications
POST   /api/notifications/read
DELETE /api/notifications/:id
```

---

## 17. Account Verification

Members can request a verified badge from their own profile page. Administrators review pending requests in the admin area and approve or reject them. Verified members display a badge on their profile and next to their name in the feed. Only administrators can change a verification status.

```text
POST /api/verification-request
GET  /api/admin/verification-requests
POST /api/admin/users/:id/verify
POST /api/admin/users/:id/reject-verification
```

---

## 18. Administration

Administrators use a dedicated interface at `/admin`. All admin endpoints require an authenticated administrator; other users receive an authorisation error.

| Area          | Capabilities                                  |
| ------------- | --------------------------------------------- |
| Users         | View, edit and delete accounts                |
| Posts         | View, edit and delete posts (the author is notified) |
| Albums        | View and delete albums                        |
| Activity      | Remove activity                               |
| Reports       | View all submitted reports with reporter, reason, target and date |
| Report reasons| Add and remove reasons                        |
| Verification  | Approve or reject verification requests       |

```text
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id

GET    /api/admin/posts
PUT    /api/admin/posts/:id
DELETE /api/admin/posts/:id

GET    /api/admin/albums
DELETE /api/admin/albums/:id

DELETE /api/admin/activity/:id
GET    /api/admin/reports
```

When an administrator deletes a post, its comments and reports are removed, it is taken out of any albums (empty albums are deleted), and the author receives a notification.

---

## 19. Frontend Pages

| Route           | Page            | Access     |
| --------------- | --------------- | ---------- |
| `/`             | Splash          | Logged out |
| `/home`         | Home and feeds  | Members    |
| `/users/:id`    | Profile         | Members    |
| `/edit-profile` | Edit profile    | Members    |
| `/friends`      | Friends         | Members    |
| `/search`       | Search          | Members    |
| `/create-post`  | Create post     | Members    |
| `/post/:id`     | Post            | Members    |
| `/albums`       | Albums          | Members    |
| `/albums/:id`   | Album           | Members    |
| `/create-album` | Create album    | Members    |
| `/hidden-posts` | Hidden posts    | Members    |
| `/admin`        | Admin dashboard | Admins     |

Clicking the Woggle logo takes the user to the home page. React Router navigates between pages without a full reload.

---

## 20. Website Design

Woggle uses a Scouting and outdoor-adventure-inspired visual identity with a consistent header and layout across all pages except the splash page.

| Colour           | Hex       |
| ---------------- | --------- |
| Primary purple   | `#4b2e83` |
| Secondary purple | `#5e3a9e` |
| Light purple     | `#7c52c4` |
| Gold             | `#d4a537` |
| Cream            | `#f7f4ec` |
| Dark cream       | `#efe9db` |
| Charcoal         | `#2b2b2b` |

Colours are defined as CSS variables and applied through shared styles and Tailwind classes, so navigation, buttons, forms, posts, albums, profiles, feeds, notifications and the admin area share one look. A theme toggle switches between light and dark mode.

---

## 21. Docker Rebuild and Troubleshooting

After changing backend code:

```bash
docker compose build backend
docker compose up
```

If Docker appears to be using an old version of the backend:

```bash
docker compose build --no-cache backend
docker compose up
```

To rebuild everything from scratch:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

If the site loads but shows no data, check that `backend/.env` exists, that `MONGODB_URI` is correct and reachable from Docker, and that the database has been seeded.

---

## 22. Testing Checklist

### Authentication and access control

- [ ] Register (automatically logged in)
- [ ] Log in, log out, invalid login
- [ ] Logged-out visitors only see the splash page
- [ ] Admin login goes to `/admin`; admin routes reject members

### Profiles and friends

- [ ] View and edit a profile; change the profile image (including drag and drop)
- [ ] Non-friend profile shows only name and picture
- [ ] Send, accept, decline and remove friend requests
- [ ] A friend's full profile is visible but not editable

### Posts and comments

- [ ] Create a post with image, description and hashtags
- [ ] Edit description and hashtags; image cannot change
- [ ] Delete an owned post (comments removed)
- [ ] Like and comment
- [ ] Hashtags link to search results
- [ ] Post page lists the albums it belongs to

### Albums

- [ ] Create, edit and delete an album (posts are kept)
- [ ] Add and remove posts
- [ ] Hashtag suggestions appear when creating or editing
- [ ] Deleting the only post in an album also deletes the album
- [ ] Deleting a post in a larger album only removes it from that album

### Feeds and search

- [ ] Local and global feeds; newest and popular sorting
- [ ] Favourited users' posts appear first
- [ ] Search users, posts and albums
- [ ] Incomplete and misspelled searches; autocomplete

### Reporting and administration

- [ ] Log in as the admin and add at least one report reason
- [ ] Report another member's post using a predefined reason
- [ ] Cannot report own post or account
- [ ] Post with three reports is hidden and appears under Hidden Posts
- [ ] Reports appear in the admin interface
- [ ] Add and remove report reasons
- [ ] Admin edits and deletes users, posts and albums

### Notifications and verification

- [ ] Admin deletes a member's post and the member sees a notification
- [ ] Notifications can be read and dismissed
- [ ] Member requests verification
- [ ] Admin approves, and the badge shows on the profile and feed
- [ ] Admin rejects, and the member is notified and can request again

### Docker

- [ ] `docker compose up --build` starts both containers
- [ ] Seed command completes successfully
- [ ] Frontend loads at `http://localhost:5173` and shows data