# User Management API

A simple RESTful API built with **Node.js**, **Express**, and **SQLite** for managing users.  
This project demonstrates CRUD operations with structured routes, controllers, and database integration.

---

##  Features
- Create a new user
- Get all users
- Update user details
- Delete a user
- SQLite database with schema initialization
- Error handling with proper status codes
- Logging using Morgan

---

##  Tech Stack

- **Node.js** (Express.js)  
- **SQLite3** (Lightweight relational database)  
- **Morgan** (Logging middleware)  
- **Body-Parser** (JSON request parsing)

---

##  Project Structure

project-root/
│── app.js # Main application file
│── package.json # Dependencies and scripts
│── config/
│ └── db.js # SQLite database connection
│── controllers/
│ └── userController.js # Controller logic for CRUD
│── routes/
│ └── userRoutes.js # Route definitions
│── database/
│ └── schema.sql # Database schema & seed data
│── README.md # Project documentation



---

##  Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/user-management-api.git
   cd user-management-api

2. Install dependencies:
   ````bash 
   npm install

3. Start the server:
    ````bash 
    npm start


The API will be available at:

http://localhost:3000

## API Endpoints
1. Create a User

POST /create_user
Request Body (JSON):

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "age": 25
}


Response:

{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "created_at": "2025-08-16T06:45:00Z"
}

2. Get All Users

POST /get_users
Response:

[
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "created_at": "2025-08-16T06:45:00Z"
  }
]

3. Update a User

POST /update_user
Request Body (JSON):

{
  "full_name": "Updated Name",
  "age": 26
}


Response:

{
  "message": "User updated successfully"
}

4. Delete a User

POST /delete_user 
Response:

{
  "message": "User deleted successfully"
}
