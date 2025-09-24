# Auth + Agent Chat App

## Prequisities
- **Node.js**: v20.x or higher
- **Package Manager**: npm or yarn

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

---

## Environment Variables
All secrets are managed through environment variables. Create a `.env.local` file based on the template below:  

**.env.example**
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=
OPENAI_API_KEY=
```

---

## Agent and Backend Choice
I used **Supabase** as the backend for authentication and database storage. It provides Postgres with built-in Row Level Security. Faster solution for authentication and DB. 
The AI agent is powered by **GROQ's API**, chosen for large quota limit and faster solutions.


## Auth Flow 
- User Registration/Login: Users create accounts or sign in using email/password through Supabase Auth.
- Once authenticated, a session token is issued and verified on each request.  
- Protected routes (such as `/chat`) redirect unauthenticated users to `/signin`.  
- Upon logout, the session is cleared, and direct access to protected pages is blocked until re-authentication.  

## Protected Route Behavior:

/chat: Requires active authentication session; unauthorized users redirected to home page
/signin: Public routes that redirect authenticated users to /chat
API Routes: All /api/chat and /api/messages endpoints validate session tokens before processing
Middleware Protection: Next.js middleware intercepts requests at the edge, enforcing authentication before page rendering

---

## Security Statement
- All chat messages are **encrypted at rest** (using AES-256-GCM encryption) before being stored in Supabase, making them unreadable even in the database UI.  
- **Row Level Security** policies ensure users can only read and insert their own messages.  
- **Secrets** (API keys, encryption key, service role) are never hardcoded and are securely managed via environment variables.  
- Together, these measures provide strong baseline security for both data privacy and access control.  



