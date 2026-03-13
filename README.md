# 🚗 Car Rental System

## 1. Description
The Car Rental System is a full-stack web application that allows users to browse available cars, view details, and book them for rental.  
It also includes an admin dashboard where administrators can manage cars, bookings, and users.

The project demonstrates full-stack development including frontend UI design, backend API development, authentication, database management, and payment integration.

---

## 2. Features

### User Features
- User registration and login
- Browse available cars
- View car details and images
- Search and filter cars
- Book cars with selected dates
- Secure online payment
- View booking history
- Submit reviews and ratings

### Admin Features
- Add new cars
- Edit car details
- Delete cars
- Manage bookings
- View payment records

---

## 3. Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer (for image uploads)

### Database
- PostgreSQL

### Payment Integration
- Stripe

---

## 4. Project Structure

car-rental-system
│
├── frontend
│ ├── src
│ │ ├── components
│ │ ├── pages
│ │ ├── context
│ │ └── App.jsx
│
├── backend
│ ├── routes
│ ├── controllers
│ ├── middleware
│ ├── config
│ └── server.js
│
├── package.json
└── README.md

---

## 5. Installation

Clone the repository:

git clone https://github.com/mmaaz46/car-rental-system.git


Navigate into the project folder:

cd car-rental-system


Install frontend dependencies:

cd frontend
npm install


Install backend dependencies:

cd backend
npm install

---

## 6. Running the Project

Start the backend server:

npm run server


Backend will run on:

http://localhost:5000


Start the frontend:

npm run dev

Frontend will run on:

http://localhost:5173

---

## 7. API Endpoints

Example APIs used in the system:

GET /api/cars
POST /api/auth/register
POST /api/auth/login
POST /api/bookings
POST /api/payments

These APIs allow the frontend to fetch cars, authenticate users, and manage bookings.

---
## 8. Screenshots

### Home Page
![Home Page](https://github.com/mmaaz46/car-rental-system/raw/main/Home-Page.png)

### Booking Page
![Booking Page](https://github.com/mmaaz46/car-rental-system/raw/main/Booking-Page.png)

### Admin Dashboard
![Admin Dashboard](https://github.com/mmaaz46/car-rental-system/raw/main/Admin-Dashboard.png)

---

## 9. Author

Mohammed Maaz  

GitHub:  
https://github.com/mmaaz46

---

## 10. Learning Outcome

This project helped me learn:

- Full-stack web development
- REST API development
- Database schema design
- Authentication and authorization
- Payment gateway integration
- Debugging and problem solving
