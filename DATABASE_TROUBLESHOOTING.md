# Database Integration Troubleshooting Guide

This guide helps you troubleshoot common issues with the database integration in the AI Crypto Trading platform.

## Storage Options

The application supports two storage options:

1. **Prisma ORM**: A type-safe database client for Node.js and TypeScript (recommended)
2. **localStorage**: A fallback option that stores data in the browser

The application will automatically use Prisma if `DATABASE_URL` is configured. If not, it will fall back to localStorage.

## Environment Configuration

The application now uses a single `.env.local` file for all environment variables. Here's a sample configuration:

```
# Database configuration
# The application will use Prisma for database operations
# If DATABASE_URL is not set, it will fall back to localStorage
DATABASE_URL="postgresql://username:password@localhost:5432/ai_crypto_trading?schema=public"
```

## Automatic Fallback

The application includes an automatic fallback mechanism:

1. If Prisma is configured but the database connection fails, it will use localStorage
2. If `DATABASE_URL` is not set, localStorage will be used automatically

This ensures that your application will always work, even if there are issues with the database connection.

## Common Errors

### "Error fetching watchlist: {}"

This error occurs when the application fails to fetch the watchlist data from the database.

**Possible causes:**

1. Database credentials are incorrect or missing
2. The watchlists table doesn't exist in your database
3. Network connectivity issues

**Solutions:**

1. **Check your database credentials**:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_crypto_trading?schema=public"
   ```

   - Make sure there are no extra spaces or quotes in this value
   - Verify that the username, password, host, and database name are correct

2. **Verify the database setup**:

   - Run `npx prisma migrate dev` to create the tables
   - Run `npx prisma generate` to update the client

3. **Check network connectivity**:

   - Open your browser's developer tools (F12)
   - Go to the Network tab
   - Look for requests to your database
   - Check for any failed requests

4. **Verify database permissions**:
   - Check that the database user has the necessary permissions
   - Verify that your connection string is correct

### "Error creating watchlist: {}"

This error occurs when the application fails to create a new watchlist in the database.

**Possible causes:**

1. Insufficient permissions
2. Database constraints violation
3. Network issues

**Solutions:**

1. **Check permissions**:

   - Check that the database user has write permissions

2. **Verify table structure**:

   - Run `npx prisma db pull` to update your schema from the database
   - Run `npx prisma generate` to update the client

3. **Test with database tools**:
   - Use Prisma Studio (`npx prisma studio`) to test database operations

## Hydration Errors

Hydration errors like `<div> cannot be a descendant of <p>` occur when the HTML structure rendered on the server doesn't match what's rendered on the client.

**Solutions:**

1. **Fix HTML nesting issues**:

   - Make sure you're not nesting block elements (like `<div>`) inside inline elements (like `<p>`)
   - Replace problematic `<p>` tags with `<div>` tags when you need to nest other elements inside
   - Use `<span>` for inline content inside `<p>` tags

2. **Avoid conditional rendering that differs between server and client**:
   - Make sure any conditions that affect the HTML structure are consistent between server and client
   - Use `useEffect` for client-side-only code

## Fallback Mechanism

The application is designed with a fallback mechanism that uses localStorage when the database is unavailable. This ensures that users can still use the watchlist feature even if there are issues with the database connection.

If you're experiencing persistent issues with your database, you can remove or comment out the `DATABASE_URL` in your `.env.local` file to use localStorage exclusively.

## Testing Your Setup

To verify that your database integration is working correctly:

1. **Clear localStorage**:

   - Open your browser's developer tools (F12)
   - Go to the Application tab
   - Select "Local Storage" in the sidebar
   - Clear the localStorage for your site

2. **Restart the application**:

   - Refresh the page
   - The application should fetch the watchlist from your database
   - If successful, you should see your watchlist data

3. **Add a new coin**:

   - Add a new coin to your watchlist
   - Check the Network tab in developer tools to see the request to your database
   - Verify that the request succeeds

4. **Check your database directly**:
   - Run `npx prisma studio`
   - Verify that your watchlist data is stored correctly

## Still Having Issues?

If you're still experiencing problems after trying these solutions:

1. **Enable debug logging**:

   - Open your browser's developer tools
   - Go to the Console tab
   - Look for any error messages related to your database

2. **Verify your database settings**:

   - Check that your database is running
   - Verify that your connection string is correct

3. **Try using localStorage**:
   - Remove or comment out the `DATABASE_URL` in your `.env.local` file
   - Restart the application
   - The application will use localStorage instead of Prisma
