# BeeSeek Marketing - Setup Instructions

## 🔧 Environment Setup

The `.env.local` file has been created with your Supabase credentials.

## 📊 Database Setup

### Step 1: Create the Managers Table

1. Go to your Supabase project: https://npxxvrqbicymhrttjyrh.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL query to create the `managers` table

### Step 2: Create the Contacts Tables

1. In the SQL Editor
2. Copy and paste the contents of `supabase-contacts-setup.sql`
3. Run the SQL query to create `contacts`, `manager_contacts`, and `contact_history` tables

### Step 3: Seed the Database

After creating all tables, seed them with data:

**Seed Managers:**
```bash
curl -X POST http://localhost:3000/api/seed
```

**Seed Contacts:**
```bash
curl -X POST http://localhost:3000/api/seed-contacts
```

Or visit these URLs in your browser.

This will create:
- **3 Managers:** Tosin, Jimi, Kunle (passwords: their names in lowercase)
- **1 Admin:** admin (password: admin123)
- **30 Sample Contacts:** Various businesses across different social platforms

## 🚀 Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📝 Login Credentials

### Managers
| Manager | Password |
|---------|----------|
| Tosin   | tosin    |
| Jimi    | jimi     |
| Kunle   | kunle    |

### Admin
| Username | Password  |
|----------|-----------|
| admin    | admin123  |

**Admin Access:** Click "Admin" button on homepage → `/admin/login` → `/admin/dashboard`

## 🔐 Authentication Flow

1. Visit `/login` to access the login page
2. Enter your password (name in lowercase)
3. Upon successful login, you'll be redirected to `/dashboard`
4. JWT token is stored in an HTTP-only cookie
5. Click "Logout" to end your session

## 📋 Contact Management System

### How It Works

1. **Initial Assignment**: Each manager gets 5 random contacts when they first log in
2. **24-Hour Timer**: Contacts expire after 24 hours from assignment
3. **Contact Rotation**: 
   - If a contact is NOT messaged within 24 hours, it goes back into the pool
   - It can be reassigned to ANY manager (including the same one randomly)
   - If a contact IS messaged, it stays with that manager
4. **Real-time Timer**: Dashboard shows countdown until contact list refresh
5. **Isolated Lists**: Managers can't see each other's contact lists

### Contact Actions

- **Message**: Mark contact as messaged (first step)
- **Convert**: Mark contact as converted (success!)
- **Reject**: Mark contact as rejected (not interested)

### Contact States

- **Pending**: Not yet messaged
- **Messaged**: Contact has been reached out to
- **Converted**: Contact became a customer
- **Rejected**: Contact declined or not interested

## 📁 Project Structure

```
beeseek-marketing/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # Login endpoint
│   │   │   ├── logout/route.ts       # Logout endpoint
│   │   │   └── me/route.ts           # Get current user
│   │   ├── contacts/
│   │   │   ├── route.ts              # GET contacts, PATCH update
│   │   │   └── timer/route.ts        # Get refresh timer
│   │   ├── seed/route.ts             # Seed managers data
│   │   └── seed-contacts/route.ts    # Seed contacts data
│   ├── components/
│   │   └── Leaderboard.tsx           # Leaderboard component
│   ├── admin/
│   │   ├── login/page.tsx            # Admin login page
│   │   └── dashboard/page.tsx        # Admin dashboard
│   ├── dashboard/
│   │   └── page.tsx                  # Manager dashboard with contacts
│   ├── login/
│   │   └── page.tsx                  # Manager login page
│   └── page.tsx                      # Landing page with leaderboard
├── lib/
│   ├── jwt.ts                        # JWT utilities
│   └── supabase.ts                   # Supabase client
├── .env.local                        # Environment variables
├── supabase-setup.sql                # Managers table schema
└── supabase-contacts-setup.sql       # Contacts tables schema
```

## 🎨 Features

### Public Features
- ✅ Landing page with manager leaderboard
- ✅ Real-time stats from Supabase
- ✅ Responsive design

### Authentication
- ✅ Password-only login (no username required)
- ✅ JWT authentication with HTTP-only cookies
- ✅ Protected dashboard route
- ✅ Session management

### Dashboard Features
- ✅ 24-hour countdown timer
- ✅ 5 contacts per manager
- ✅ Contact rotation system
- ✅ Mark contacts as: Messaged, Converted, Rejected
- ✅ View contact profiles (external links)
- ✅ Real-time updates
- ✅ Automatic stats calculation

### Backend Logic
- ✅ Smart contact assignment algorithm
- ✅ Automatic expiration after 24 hours
- ✅ Contact pooling for unmessaged contacts
- ✅ Random redistribution
- ✅ Contact history tracking
- ✅ Manager statistics auto-update

## 📊 Database Tables

### managers
- Stores manager info, passwords, and stats
- Stats auto-update based on contact interactions

### contacts
- Master list of all available contacts
- Shared across all managers

### manager_contacts
- Links managers to their assigned contacts
- Tracks assignment time and expiration
- Stores contact status (messaged, converted, rejected)

### contact_history
- Audit log of all contact interactions
- Tracks assignments, messages, conversions, etc.

## 🔒 Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Tokens are stored in HTTP-only cookies (prevents XSS)
- No RLS is enabled (as requested)
- Each manager only sees their own contacts

## 🎯 Next Steps

After setup, you can:
1. Add more contacts via the database
2. Customize the contact assignment algorithm
3. Add analytics and reporting
4. Implement notes/comments on contacts
5. Add notifications for expiring contacts
6. Create admin panel for oversight
