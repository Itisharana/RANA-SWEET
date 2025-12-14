#  Sweet Shop Management System [RANA SWEETS]

## 📌 Project Overview

The Sweet Shop Management System is a full-stack web application designed to manage a sweet shop’s operations efficiently. It allows users to browse sweets, manage inventory, handle orders, and maintain data securely using a modern tech stack.

The project demonstrates practical implementation of frontend–backend integration, database management, authentication, and deployment using industry-standard tools.

🔗 Live Application:
    https://sweet-shop-management-system-neon.vercel.app/



## 🎯 Purpose of the Project

* To digitize sweet shop operations
* To manage sweets, orders, and users efficiently
* To gain hands-on experience with full-stack development
* To implement real-world backend APIs with a modern frontend



## ✨ Key Features & Functionalities

### 1. User Authentication & Authorization

* Secure user registration and login
* Password hashing for data security
* Role-based access (Admin / User)

### 2. Sweet Management

* Add new sweets with name, price, quantity, and category
* Update sweet details
* Delete sweets when out of stock
* View all available sweets

### 3. Inventory Management

* Track available quantity of each sweet
* Automatically update stock after orders
* Prevent ordering beyond available stock

### 4. Order Management

* Place orders for selected sweets
* Calculate total price dynamically
* Store order history

### 5. Responsive User Interface

* Clean and user-friendly UI
* Responsive design for desktop and mobile
* Smooth navigation and state handling

### 6. API-Based Architecture

* RESTful backend APIs
* Proper request validation and error handling
* Separation of concerns between frontend and backend



## 🛠️ Technologies Used

### Frontend

* Next.js (React Framework)
* TypeScript
* Tailwind CSS
* Radix UI / Headless UI
* React Hook Form

### Backend

* Python (FastAPI)
* MongoDB Atlas
* Pydantic
* Passlib (bcrypt)

### Database

* MongoDB (Cloud – Atlas)

### Testing

* Pytest

### Deployment

* Vercel (Frontend)
* MongoDB Atlas (Database)



## ⚙️ Project Setup & Installation

### 📁 Prerequisites

* Node.js (v18 or later)
* Python (v3.10+)
* MongoDB Atlas account
* Git



## 🔧 Backend Setup (FastAPI)

1. Clone the repository:

```bash
git clone https://github.com/your-username/sweet-shop-management-system.git
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables:
   Create a `.env` file:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/sweetshop
```

5. Run the backend server:

```bash
uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

## 🎨 Frontend Setup (Next.js)

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

## 🧪 Test Report

### Testing Tool Used

* Pytest

### Test Coverage

* API endpoint testing
* Authentication logic
* Sweet CRUD operations
* Order processing
* Error handling scenarios

### Test Execution

```bash
pytest
```

### Result Summary

| Test Category               | Status   |
| --------------------------- | -------- |
| Authentication Tests        |  Passed  |
| Sweet Management Tests      |  Passed  |
| Order Management Tests      |  Passed  |
| Validation & Error Handling |  Passed  |

✔️ All tests passed successfully without failures.

---

## 📸 Screenshots of Application

LOGIN PAGE:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fecfbf30-794f-43d6-a5f4-1fffbad2229d" />



REGISTER PAGE:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/57bf6464-ded5-441a-b964-d68b32ecd84f" />



HOME PAGE:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/93cf82ad-29b3-4ddd-8af9-d669c0574bf2" />



SWEETS OVERVIEW:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8b60c9d9-591e-4c40-ab62-da0de4423bab" />



YOUR CART:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d9f4573b-b0e5-4048-974f-df859af55271" />



PAYMENT PAGE:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c40deb08-fb9e-4d79-b277-21f9e51adc15" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a60508a4-8978-4e27-a74a-f56de5d0d229" />



ORDER SUCCESS:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6264958b-6ff1-4c6a-9f53-f8b53a547b25" />









ADMIN LOGIN PAGE:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/809d58c8-3c10-4b2c-930b-b96740f0a94c" />



ADMIN DASHBOARD:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2f9d5961-6dcd-48eb-af9e-ea7029e13934" />



ADD NEW ITEM:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d7830ee6-44cf-4113-ac5d-df62df8d1eb4" />



ORDER DETAILS:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9bb81933-5819-48b6-adb1-20726219fbc0" />



INVENTORY INSIGHTS:

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6a367d19-d92d-428f-91d9-09927316b0f0" />



## 🤖 My AI Usage

### AI Tools Used

* ChatGPT
* Orchids
* Gemini

### How I Used AI

* Used these to:

  * Understand FastAPI concepts and best practices
  * Design REST API endpoints
  * Debug backend errors and configuration issues
  * Write and improve README documentation



### Reflection on AI Impact

AI tools significantly improved my productivity by reducing development time and helping me learn faster. Instead of replacing my understanding, AI acted as a learning assistant, allowing me to focus more on logic, architecture, and debugging. I carefully reviewed and customized all AI-generated code to ensure correctness and understanding.



## 🚀 Live Deployment 

🌐 Live Application:
    https://sweet-shop-management-system-neon.vercel.app/



## 📚 Conclusion

The Sweet Shop Management System is a practical full-stack application showcasing real-world development skills, including frontend design, backend API creation, database integration, testing, and deployment. This project helped strengthen my understanding of scalable web applications and modern development workflows.



## Designed by:
   Author : Itisha Rana 
   Co-author :  Orchids, Gemini, Chatgpt
