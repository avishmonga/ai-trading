# Prisma ORM Setup Guide

This guide explains how to set up Prisma ORM for the AI Crypto Trading platform.

## Overview

Prisma ORM provides a type-safe database client that makes it easy to work with your database. This guide will help you set up Prisma with PostgreSQL for the AI Crypto Trading platform.

## Prerequisites

1. PostgreSQL database (local or hosted)
2. Node.js and npm installed

## Setup Steps

### 1. Install Prisma

```bash
npm install prisma @prisma/client
```

### 2. Initialize Prisma

```bash
npx prisma init
```

This will create a `prisma` directory with a `schema.prisma` file and a `.env` file.

### 3. Configure the Database Connection

Update the `DATABASE_URL` in your `.env.local` file with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ai_crypto_trading?schema=public"
```

Replace `username`, `password`, `localhost`, and `ai_crypto_trading` with your actual database credentials.

### 4. Define the Schema

The `schema.prisma` file should already be set up with the following model:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Watchlist {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  coins     String[] @default([])
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("watchlists")
  @@index([userId])
}
```

### 5. Create the Database Tables

Run the following command to create the tables in your database:

```bash
npx prisma migrate dev --name init
```

This will create a migration file and apply it to your database.

### 6. Generate the Prisma Client

```bash
npx prisma generate
```

This will generate the Prisma Client based on your schema.

## Environment Configuration

The application now uses a single `.env.local` file for all environment variables. Here's a sample configuration:

```
# Database configuration
# The application will use Prisma for database operations
# If DATABASE_URL is not set, it will fall back to localStorage
DATABASE_URL="postgresql://username:password@localhost:5432/ai_crypto_trading?schema=public"

# Other application settings...
```

## Storage Options

The application supports two storage options:

1. **Prisma ORM**: Uses Prisma ORM for database operations (recommended)
2. **localStorage**: Uses browser localStorage (fallback)

The application will automatically use Prisma if `DATABASE_URL` is configured. If not, it will fall back to localStorage.

## Troubleshooting

### Connection Issues

If you're having trouble connecting to your database:

1. Check that your database is running
2. Verify that your `DATABASE_URL` is correct
3. Make sure your database user has the necessary permissions
4. Check for any firewall or network issues

### Schema Issues

If you need to update your schema:

1. Update the `schema.prisma` file
2. Run `npx prisma migrate dev --name your_migration_name`
3. Run `npx prisma generate` to update the client

### Prisma Studio

Prisma provides a GUI to view and edit your database:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can view and edit your data.

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
