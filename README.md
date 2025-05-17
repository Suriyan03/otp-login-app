# OTP Login App

## Project Overview

This is a straightforward OTP (One-Time Password) based email login authentication application. It provides a secure way for users to log in by entering their email address, receiving a unique OTP via email, and then verifying it to gain access. Upon successful verification, users are issued a JWT (JSON Web Token) for subsequent authentication.

## Tech Stack

Here's a breakdown of the technologies used in this project:

-   **Frontend:** [React.js](https://react.dev/)
-   **Backend:** [Node.js](https://nodejs.org/en/) with [Express](https://expressjs.com/)
-   **API Communication:** [Axios](https://axios-http.com/docs/intro) for making HTTP requests
-   **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/) for secure user session management
-   **Database:** (You can mention your database here if you are using one, e.g., "MongoDB", "PostgreSQL", "Supabase", etc. If you're not using a persistent database for this example, you can omit this or mention it's using in-memory storage for simplicity.)
-   **Email Sending:** (Mention the library or service you're using for sending emails, e.g., "Nodemailer")

## Installation & Setup

Follow these steps to get the OTP Login App up and running on your local machine.

### 1. Clone the Repository

First, clone the project repository from GitHub to your local machine:

```bash
git clone [https://github.com/Suriyan03/otp-login-app.git](https://github.com/Suriyan03/otp-login-app.git)
cd otp-login-app

cd frontend
npm install

Once the installation is complete, you can start the React development server:

The React application will be accessible in your browser at http://localhost:3000.

cd ../backend
npm install

Environment Variables
You need to configure the backend environment variables. Create a .env file in the backend/ directory and add the following:

PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-secret-key
