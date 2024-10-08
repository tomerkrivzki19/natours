# Natours - Complete Node.js, Express, and MongoDB Bootcamp Project

Welcome to the **Natours** project! This repository contains the complete code for the Node.js, Express, and MongoDB bootcamp by Jonas Schmedtmann. The Natours project is a server-side application for managing and selling tours, complete with features for reviews, authentication, and administrative controls.

## Project Overview

The Natours application includes:

- **Tour Management:** View, add, update, and delete tours.
- **Reviews:** Add and manage reviews for tours.
- **Authentication:** Sign up, log in, and manage users with email and phone verification.
- **Admin Features:** Protected routes for admins to manage users, guides, reviews, and view sales data.
- **Email Notifications:** Send verification emails and purchase confirmations.
- **Payment Integration:** Handle tour bookings and payments.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm (Node Package Manager)
- MongoDB

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/tomerkrivzki19/natours.git

    ```

2.  **Navigate to the Project Directory:**

    ```bash
    cd natours
    ```

3.  **Install Dependencies:**

```bash
npm install

```

4. **Configure Environment Variables:**

Create a **.env** file in the root directory and set the required environment variables. Refer to **.env.example** for the required variables.

5. **Start the Application:**

   ```bash
   npm run start:dev -development
   npm run start:prod -production

   ```

6. **Run Tests (Optional):**

   ```bash
   npm run debug

   ```

## Features

- **Tour Management:** Full CRUD operations on tours.
- **Reviews:** Users can review tours, and admins can manage reviews.
- **Authentication:** Secure authentication with JWT and email/phone verification.
- **Admin Dashboard:** Admins can manage all aspects of the application.
- **Email Integration:** Automated email notifications for verification and purchases.

## Frequently Asked Questions (FAQ)

**Q1: How do I download the files?**  
A: If you're new to GitHub, click the green "Code" button and select "Download ZIP" to get the entire codebase.

**Q2: What VSCode theme are you using?**  
A: I use Oceanic Next (dimmed bg). You can find my complete VSCode setup [here](https://github.com/voronianski/oceanic-next-color-scheme).

**Q3: Can I see a final version of the course project?**  
A: The main project is Natours. You can log in with `laura@example.com` and password `test1234`. The Node.js introduction project is Node Farm.
