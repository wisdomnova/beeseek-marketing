# Admin System Documentation

## 🔐 Admin Login

**URL:** `/admin/login`
**Credentials:**
- Username: `admin`
- Password: `admin123`

## 🎯 Admin Dashboard Features

### Overview Statistics (8 Cards)

1. **Contacts in Pool** - Total contacts available for assignment
2. **Total Assignments** - All-time contact assignments to managers
3. **Total Messaged** - Contacts that have been messaged
4. **Total Converted** - Successful conversions
5. **Total Rejected** - Contacts that rejected/declined
6. **Pending** - Contacts not yet messaged
7. **Active Assignments** - Current active (not expired) assignments
8. **Overall Conversion Rate** - Platform-wide conversion percentage

### Manager Performance Table

Shows real-time stats for all managers:
- Contacts Messaged
- Contacts Converted
- Days Missed
- Days Completed
- Individual Conversion Rate
- Sorted by conversion rate (highest first)

### All Contact Assignments Table

Comprehensive view of every contact assignment:
- Contact details (username, ID, business)
- Assigned manager
- Assignment date
- Status (Active/Expired)
- Messaged status (checkmark/X)
- Result (Converted/Rejected/Pending)
- Visual indicators:
  - Yellow background for expired unmessaged contacts
  - Color-coded status badges

### Add Contact Feature

Modal form to add new contacts to the pool:
- **Contact ID** (required) - Unique identifier (e.g., CONT031)
- **Username** (required) - Social media handle (e.g., @username)
- **Business** (optional) - Business name
- **Social Media Platform** (optional) - Twitter, Instagram, LinkedIn, etc.
- **Profile Link** (optional) - URL to their profile

## 📊 API Endpoints

### Authentication

**POST** `/api/admin/login`
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "user": {
    "username": "admin",
    "id": 1,
    "role": "admin"
  }
}
```

**POST** `/api/admin/logout`
- Clears admin-token cookie

**GET** `/api/admin/me`
- Returns current admin user or null

### Data Management

**GET** `/api/admin/stats`
```json
Response:
{
  "managers": [...],
  "contacts": [...],
  "stats": {
    "totalContactsInPool": 30,
    "totalAssignments": 45,
    "totalMessaged": 28,
    "totalConverted": 15,
    "totalRejected": 5,
    "totalPending": 8,
    "activeAssignments": 15,
    "expiredUnmessaged": 3,
    "overallConversionRate": "53.57"
  }
}
```

**POST** `/api/admin/add-contact`
```json
Request:
{
  "contact_id": "CONT031",
  "username": "@newuser",
  "business": "Tech Startup",
  "social_media": "Twitter",
  "profile_link": "https://twitter.com/newuser"
}

Response:
{
  "success": true,
  "contact": {...},
  "message": "Contact added successfully"
}
```

## 🗃️ Database Tables

### admins
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security

- **Separate Authentication** - Admin uses different JWT cookie (`admin-token`)
- **Role-Based Access** - JWT includes `role: 'admin'` field
- **Password Hashing** - bcrypt with 10 rounds
- **Session Management** - 7-day token expiration
- **Authorization Checks** - All admin endpoints verify role

## 🎨 UI Features

### Color Coding
- **Blue** (#549fe5) - Primary actions, headings
- **Green** (#10b981) - Conversions, success states
- **Red** (#ef4444) - Rejections, errors
- **Yellow** (#fbbf24) - Warnings, expired items
- **Grey** (#6b7280) - Secondary info

### Visual Indicators
- Active/Expired status badges
- Checkmarks for messaged contacts
- Color-coded results (Converted/Rejected/Pending)
- Highlighted rows for expired unmessaged contacts

### Responsive Design
- Scrollable contact table (max 600px height)
- Sticky header on contact table
- Grid layout for stat cards
- Modal overlay for adding contacts

## 📈 Key Metrics Explained

### Conversion Rate Calculation
```
Conversion Rate = (Total Converted / Total Messaged) × 100
```

### Active vs Expired
- **Active**: expires_at > current time
- **Expired**: expires_at <= current time

### Expired Unmessaged
Contacts that:
1. Have expired (past 24 hours)
2. Were NOT messaged by the manager
3. Will be reassigned to managers

## 🚀 Workflow

1. **Admin Login** → Access dashboard
2. **View Overview** → See platform-wide stats
3. **Monitor Managers** → Track individual performance
4. **Review Assignments** → See all contact activity
5. **Add Contacts** → Click "Add Contact" button
6. **Fill Form** → Enter contact details
7. **Submit** → Contact added to pool
8. **Auto-Assignment** → Managers receive new contacts automatically

## 🔧 Setup Instructions

1. **Run SQL for admins table:**
   ```sql
   -- Already included in supabase-setup.sql
   ```

2. **Seed admin user:**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```
   This creates admin user with credentials above.

3. **Access admin panel:**
   - Go to homepage
   - Click "Admin" button in header
   - Login with credentials
   - Access full dashboard

## 📝 Admin Responsibilities

- Monitor platform performance
- Track manager efficiency
- Add new contacts to the system
- Review conversion patterns
- Identify expired unmessaged contacts
- Ensure contact pool is sufficient

## 🎯 Best Practices

1. **Regular Monitoring** - Check dashboard daily
2. **Contact Pool** - Maintain at least 20-30 contacts
3. **Performance Review** - Monitor manager conversion rates
4. **Expired Contacts** - Track which contacts aren't being messaged
5. **Add Quality Contacts** - Focus on high-value prospects

## 🔍 Troubleshooting

**Can't login:**
- Verify credentials (admin/admin123)
- Check if admin user was seeded
- Clear cookies and try again

**No data showing:**
- Ensure managers have been seeded
- Check if contacts were seeded
- Verify API endpoints are working

**Contact not added:**
- Check for duplicate contact_id
- Ensure required fields are filled
- Look for error messages

## 📊 Example Use Cases

### Adding Bulk Contacts
Use the add contact feature repeatedly or create a bulk import endpoint.

### Performance Review
Compare manager conversion rates to identify top performers.

### Contact Pool Management
Monitor total contacts in pool and add more when running low.

### Expired Contact Analysis
Review which contacts consistently expire unmessaged.
