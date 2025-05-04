# Monster Game

A simple multiplayer monster game built with Next.js and Supabase.

## Features

- Create and join game sessions
- Real-time player list updates
- Chat with the monster companion
- Username management
- Session persistence with Supabase

## Project Structure

- `/app` - Next.js app router pages
- `/components` - UI components
- `/utils` - Utility functions and Supabase clients
  - `/utils/actions.ts` - Server-side Supabase actions
  - `/utils/client-actions.ts` - Client-side Supabase actions
  - `/utils/session.ts` - Session management actions
  - `/utils/supabase/messages.ts` - Message management (client-side)
  - `/utils/supabase/server-messages.ts` - Message management (server-side)
  - `/utils/supabase` - Supabase client configurations

## Session Management

The game uses Supabase to manage game sessions. Each session has:

- A unique ID
- A game state object that includes:
  - Array of player usernames
  - Game status
- Timestamps for creation and updates

## Database Schema

```sql
-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id TEXT,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Set up your Supabase project and add your credentials to `.env`
4. Run the development server with `pnpm dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Game Flow

1. User creates a username
2. User creates or joins a game
3. In the lobby, players can see who's connected
4. When game starts, a chat interface appears with the monster companion
5. Players can interact with the game through text commands

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
