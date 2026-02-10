# Next.js + Python (FastAPI) Project

This project contains a Next.js frontend and a Python FastAPI backend.

## Prerequisites

- Node.js
- Python 3.8+

## Setup & Run

### 1. Backend

 Navigate to the `backend` directory:
 ```bash
 cd backend
 ```

 Create a virtual environment (optional but recommended):
 ```bash
 python -m venv venv
 source venv/bin/activate  # On Windows use `venv\Scripts\activate`
 ```

 Install dependencies:
 ```bash
 pip install -r requirements.txt
 ```

 Run the server:
 ```bash
 uvicorn main:app --reload
 ```

 The API will be available at `http://localhost:8000`.

### 2. Frontend

 Open a new terminal and navigate to the `frontend` directory:
 ```bash
 cd frontend
 ```

 Install dependencies:
 ```bash
 npm install
 ```

 Run the development server:
 ```bash
 npm run dev
 ```

 Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
