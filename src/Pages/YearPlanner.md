## ✅ 1. GET /api/sessions
Purpose: Load academic sessions for dropdown
Response (array of objects):
```
[
  { "id": 1, "name": "2024–2025" },
  { "id": 2, "name": "2025–2026" }
]
```

## ✅ 2. GET /api/holidays
Purpose: Fetch all holidays
Response (array of objects):
```
[
  {
    "id": 101,
    "session_id": 1,
    "name": "Summer Break",
    "start": "2024-06-01",
    "end": "2024-07-15",
    "active": true
  },
  {
    "id": 102,
    "session_id": 1,
    "name": "Winter Holiday",
    "start": "2024-12-20",
    "end": "2025-01-05",
    "active": false
  }
]
🔹 start and end must be ISO date strings (YYYY-MM-DD)
🔹 active is a boolean
🔹 session_id is an integer 
```
## ✅ 3. POST /api/holidays
Purpose: Create a new holiday
Request Body:
```
{
  "session_id": 1,
  "name": "Diwali Break",
  "start": "2024-11-01",
  "end": "2024-11-05"
}
🔹 All fields required
🔹 session_id: integer
🔹 name: string
🔹 start, end: YYYY-MM-DD strings 

Success Response (201 Created):
{
  "id": 103,
  "session_id": 1,
  "name": "Diwali Break",
  "start": "2024-11-01",
  "end": "2024-11-05",
  "active": true
}
```
## ✅ 4. PUT /api/holidays/{id}
Purpose: Update an existing holiday
Request Body:
```
{
  "name": "Extended Diwali Break",
  "start": "2024-10-30",
  "end": "2024-11-07"
}
🔹 Only name, start, end are sent (no session_id or active in update)
🔹 id comes from URL path (e.g., /holidays/103) 

Success Response (200 OK):
{
  "id": 103,
  "session_id": 1,
  "name": "Extended Diwali Break",
  "start": "2024-10-30",
  "end": "2024-11-07",
  "active": true
}
```
## ✅ 5. DELETE /api/holidays/{id}
Purpose: Delete a holiday
Response on success (200/204 OK):
No body needed — just a successful status (e.g., 204 No Content or 200 OK)

## ✅ 6. PATCH /api/holidays/{id}/toggle-status
Purpose: Toggle active status (true ↔ false)
Request Body:
None required (or optionally {})
```
{
  "id": 101,
  "session_id": 1,
  "name": "Summer Break",
  "start": "2024-06-01",
  "end": "2024-07-15",
  "active": false
}
```