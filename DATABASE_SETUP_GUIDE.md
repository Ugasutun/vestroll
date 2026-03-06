# Database Setup and Testing Guide

Follow these steps to set up your PostgreSQL database and test the full authentication flow.

## 1. PostgreSQL Database Setup

1.  **Install PostgreSQL**: If not already installed, download and install [PostgreSQL](https://www.postgresql.org/download/).
2.  **Start PostgreSQL**: Ensure the PostgreSQL service is running.
3.  **Create Database**: Open your terminal (or pgAdmin) and create a new database:
    ```bash
    psql -U postgres -c "CREATE DATABASE vestrolldb;"
    ```

## 2. Environment Configuration

1.  Open your `.env` file in the project root.
2.  Update the `DATABASE_URL` with your PostgreSQL credentials:
    ```env
    DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vestrolldb
    ```
    _(Replace `YOUR_PASSWORD` with your actual PostgreSQL password)_

## 3. Apply Schema

Sync your database with the project's schema using Drizzle:

```bash
pnpm db:push
```

## 4. Testing the Account Creation Flow

1.  **Start Development Server**:
    ```bash
    pnpm dev
    ```
2.  **Register**: Go to `http://localhost:3000/register` and fill in the details.
3.  **Set Password**: You will be redirected to the "Add a password" page. Create your password.
4.  **Verify Email**:
    - You will be redirected to the "Verify Email" page.
    - **Check your Terminal/Console** where `pnpm dev` is running.
    - Look for a line like: `[Email Mock] Sending OTP 123456 to your@email.com`.
    - Enter those **6 digits** on the verification page.

## 5. Testing the Login & 2FA Flow

1.  **Login**: Go to `http://localhost:3000/login`.
2.  **Credentials**: Enter the email and password you just created.
3.  **2FA Verification**:
    - You will be redirected to the 2FA (6-digit code) screen.
    - Enter the default code: `000000`.
4.  **Dashboard**: You should now be logged in and redirected to the **Dashboard**.

---

> [!TIP]
> You can also use `pnpm db:studio` to open a GUI and view your users directly in the database.
