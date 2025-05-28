# Supabase Integration Setup

This guide will help you set up the Supabase integration for the Cookie Extractor server.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setting Up Environment Variables

1. Create a `.env` file in the server directory based on this template:

```
# Server configuration
PORT=3001
JWT_SECRET=your-custom-secret-key

# Supabase configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-api-key
```

2. Replace the placeholder values:
   - `JWT_SECRET`: A secure random string for JWT signing
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase Service Role API key (or anon/public key for testing)

## Setting Up Supabase Tables

In your Supabase project, create a `profiles` table with the following schema:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a Row Level Security policy that allows users to read/update only their own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Creating a Test User

1. Go to the Authentication section in your Supabase dashboard
2. Click on "Users" and then "Invite"
3. Enter an email address and click "Invite"
4. The user will receive an email to set their password
5. Alternatively, you can enable Email/Password sign-up and create users directly from your app

## Testing the Integration

1. Start your server:
   ```
   cd server
   npm run dev
   ```

2. In your Chrome extension, click on the "Supabase Login" button
3. Enter the email and password of your Supabase user
4. Click "Login"
5. After successful authentication, you should see your user data displayed
6. Click "Get Full Profile" to retrieve the full profile information from Supabase

## Common Issues

1. **Authentication Failed**: Ensure your Supabase credentials are correct in the `.env` file
2. **CORS Errors**: Make sure your Supabase project allows requests from your extension's origin
3. **Profile Not Found**: Ensure the user exists in the `profiles` table in your Supabase database 