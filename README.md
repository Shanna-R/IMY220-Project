# IMY220-Project

WOGGLE - DELIVERABLE 1

Woggle is a social media platform designed for Scouts
to share adventures, camps, achievements and memories.

TECHNOLOGIES

Frontend:
- React
- Vite
- React Router

Backend:
- Node.js
- Express

Containerisation:
- Docker


PROJECT STRUCTURE

frontend/
backend/
README.txt


RUNNING THE FRONTEND

cd frontend
npm install
npm run dev


RUNNING THE BACKEND

cd backend
npm install
npm start


DOCKER FRONTEND

cd frontend

docker build -t woggle-frontend .

docker run --rm -p 5173:5173 woggle-frontend


DOCKER BACKEND

cd backend

docker build -t woggle-backend .

docker run --rm -p 5000:5000 woggle-backend


FRONTEND

http://localhost:5173


BACKEND

http://localhost:5000


BACKEND HEALTH CHECK

http://localhost:5000/api/health


ROUTES

/
Splash Page

/home
Home Feed

/profile/:id
Dynamic Profile Page

/post/:id
Dynamic Post Page

/search
Search Page

/friends
Friends Page

/create-post
Create Post Page

/edit-profile
Edit Profile Page


AUTHENTICATION ENDPOINTS

POST /api/auth/signin

POST /api/auth/signup


D1 NOTES

The application uses dummy data for the frontend.
Authentication endpoints return dummy responses.
No database is required for Deliverable 1.


GITHUB REPOSITORY

https://github.com/Shanna-R/IMY220-Project.git

Created by Shanna Reinecke