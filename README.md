# Expense Tracker

<!-- Write 1-2 sentences: what does your app do? -->

A full-stack web application that helps users log, track, and manage daily expenses efficiently. It features real-time category filtering, summary analytics, and persistent storage using a PostgreSQL database.

## How to run

1. **Database Setup:**
   * Open **pgAdmin**  and create the database:
     ```sql
     CREATE DATABASE expense_tracker;
     ```
   * Run the `schema.sql` script to create the table structure and seed initial data:
     ```sql
     \c expense_tracker
     \i schema.sql
     ```

2. **Backend Setup:**
   * Open your terminal and navigate to the backend directory:
     ```bash
     cd backend
     ```
   * Install the required packages:
     ```bash
     npm install
     ```
   * Create a `.env` file in the `backend` folder with your PostgreSQL credentials:
     ```env
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=expense_tracker
     PORT=3000
     ```
   * Start the server:
     ```bash
     node server.js
     ```

3. **Frontend Setup:**
   * Open `frontend/index.html` in VS Code.
   * Launch it using the **Live Server** extension (or open `index.html` directly in your web browser).



## Features

<!-- List what your app can do. Tick what you finished. -->

- [✓] Add an expense (with validation)
- [✓] Delete an expense
- [✓] Edit an expense
- [✓] Filter by category
- [✓] Summary cards (total, count, highest)
- [✓] Data is saved in a PostgreSQL database

## Screenshots

![Desktop View](./screenshots/desktop1.png)
![Desktop View](./screenshots/desktop2.png)
![Mobile View](./screenshots/mobile.png)

## Demo Video

You can watch a full walkthrough video of the application:
👉 [Watch Demo Video on Google Drive](https://drive.google.com/file/d/1JYi7-NmJMBfWVBVuh3f3Wo5OKkcMMt3q/view?usp=drive_link)

## What was the hardest part?

The most challenging part was encountering a `Connection terminated unexpectedly` error when connecting Express to PostgreSQL[cite: 1, 5]. This happened because the Express server port (`3000`) was mistakenly assigned instead of the default PostgreSQL port (`5432`) in the `Pool` configuration[cite: 1, 5]. I resolved it by properly setting `DB_PORT` in the `.env` file and ensuring fallback defaults[cite: 1, 5].
