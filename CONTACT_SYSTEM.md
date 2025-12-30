# Contact Management System - Technical Overview

## 🔄 Contact Rotation Algorithm

### Assignment Logic

1. **Initial Check**: System checks if manager has 5 active contacts
2. **If Less Than 5**: Assigns new contacts from available pool
3. **Contact Pool Priority**:
   - First: Contacts never assigned to anyone
   - Second: Expired contacts that were NOT messaged (randomized)
   - Third: Random selection from all available

### Expiration & Redistribution

```
Manager gets 5 contacts at 12:00 PM
↓
Contacts expire at 12:00 PM next day (24 hours)
↓
If contact was NOT messaged:
  → Goes back to general pool
  → Can be assigned to ANY manager (random)
  → Original manager can get it again (by chance)
↓
If contact WAS messaged:
  → Stays with that manager permanently
  → Used for conversion tracking
```

### Timer System

- **Countdown Timer**: Shows time until oldest contact expires
- **Auto-refresh**: Checks every minute
- **Visual Display**: Hours, minutes, seconds (e.g., "23h 45m 30s")
- **On Expiration**: Contact list automatically refreshes on next fetch

## 📊 Database Schema Details

### contacts (Master List)
```sql
- id (PK)
- contact_id (unique identifier, e.g., "CONT001")
- username (social media handle)
- business (business name)
- social_media (platform: Twitter, Instagram, LinkedIn, Facebook)
- profile_link (URL to profile)
- created_at, updated_at
```

### manager_contacts (Assignment Table)
```sql
- id (PK)
- manager_id (FK → managers)
- contact_id (FK → contacts)
- assigned_at (timestamp when assigned)
- expires_at (assigned_at + 24 hours)
- messaged (boolean - has manager messaged?)
- converted (boolean - did contact convert?)
- rejected (boolean - did contact reject?)
- messaged_at, converted_at, rejected_at (timestamps)
- notes (text field for manager notes)
- created_at, updated_at
```

### contact_history (Audit Log)
```sql
- id (PK)
- manager_id (FK)
- contact_id (FK)
- action (assigned, messaged, converted, rejected, expired)
- details (JSONB - additional metadata)
- created_at
```

## 🎯 API Endpoints

### GET `/api/contacts`
**Purpose**: Fetch manager's current contact list
**Auth**: Required (JWT cookie)
**Returns**: Array of 5 contacts with full details
**Side Effect**: Auto-assigns contacts if < 5

### PATCH `/api/contacts`
**Purpose**: Update contact status
**Auth**: Required (JWT cookie)
**Body**:
```json
{
  "managerContactId": 123,
  "action": "message" | "convert" | "reject",
  "notes": "optional notes"
}
```
**Side Effect**: Updates manager stats, logs history

### GET `/api/contacts/timer`
**Purpose**: Get time until contact refresh
**Auth**: Required (JWT cookie)
**Returns**:
```json
{
  "nextRefresh": "2025-12-22T12:00:00Z",
  "hoursRemaining": 23,
  "minutesRemaining": 45,
  "totalSeconds": 85500
}
```

## 🔧 Manager Statistics Auto-Update

When a contact status changes:
1. Recalculates `contacts_messaged` (count of messaged=true)
2. Recalculates `contacts_converted` (count of converted=true)
3. Updates `conversion_rate` = (converted / messaged) * 100
4. Updates leaderboard rankings automatically

## 🚀 Contact Assignment Flow

```
Manager logs in → Dashboard loads
↓
Fetch contacts (GET /api/contacts)
↓
Check active contacts (expires_at > NOW)
↓
Count < 5?
  YES → Assign new contacts
    ↓
    Query available contacts
    ↓
    Exclude currently assigned (any manager)
    ↓
    Get unmessaged expired OR new contacts
    ↓
    Randomize selection
    ↓
    Insert into manager_contacts
    ↓
    Log to contact_history
  NO → Return existing contacts
↓
Return to dashboard
```

## ⏱️ 24-Hour Cycle Example

**Day 1 - 12:00 PM**
- Jimi gets: John, Sarah, Mike, Emily, David
- Tosin gets: Lisa, Tom, Anna, James, Maria
- Kunle gets: Robert, Jennifer, Kevin, Rachel, Daniel

**Day 1 - Throughout Day**
- Jimi messages: John, Sarah (Emily expires unmessaged)
- Tosin messages: Lisa, Tom, Anna, James, Maria (all 5!)
- Kunle messages: Robert (others expire unmessaged)

**Day 2 - 12:00 PM (Refresh)**
- Jimi needs: 3 new contacts (kept John, Sarah)
  - Could get: Emily again, or Jennifer, Kevin, Rachel, Daniel
- Tosin needs: 0 new (messaged all 5)
  - Keeps all 5 for tracking
- Kunle needs: 4 new contacts (kept Robert)
  - Could get: Mike, Emily, Jennifer, Kevin, Rachel, Daniel

## 📈 Performance Optimizations

1. **Indexes**: Added on manager_id, expires_at, messaged
2. **Batch Operations**: Assigns multiple contacts in one query
3. **Triggered Updates**: Auto-update timestamps
4. **Efficient Queries**: Uses CTEs and joins for complex logic

## 🎨 UI States

### Contact Row States
- **Pending** (grey): Not messaged yet
- **Messaged** (blue): Contacted, awaiting response
- **Converted** (green): Success! Became customer
- **Rejected** (red): Declined or not interested

### Action Buttons
- **Pending**: Show "Message" button
- **Messaged**: Show "Convert" and "Reject" buttons
- **Converted/Rejected**: No buttons (final state)

## 🔐 Security Considerations

1. **Manager Isolation**: Each manager only sees their own contacts
2. **Validation**: Check manager_id matches authenticated user
3. **Expiration Logic**: Server-side validation prevents manipulation
4. **No RLS**: As requested, using application-level security
5. **Audit Trail**: All actions logged in contact_history

## 📝 Future Enhancements

- [ ] Notes field on dashboard
- [ ] Email notifications for expiring contacts
- [ ] Export contact history to CSV
- [ ] Advanced filtering and search
- [ ] Bulk actions (message all, etc.)
- [ ] Contact priority/tagging system
- [ ] Performance analytics dashboard
- [ ] Automated follow-up reminders
