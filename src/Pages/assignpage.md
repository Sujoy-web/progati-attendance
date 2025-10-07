Qwen3-Max
5:36 pm
RFID Assignment Page – README
📌 Overview
The RFID Assignment Page is a React-based frontend interface designed for school or institutional administrators to efficiently assign unique RFID cards to students. The workflow is optimized for bulk scanning: once a class, section, and academic session are selected, the user clicks "Search Students" to load the relevant student list. The RFID input field is automatically focused, enabling seamless card scanning. Each scanned RFID is automatically assigned to the next unassigned student in serial order (by roll number). The system prevents duplicate assignments—if an RFID is already in use, the scan is rejected with an error. Manual overrides (search, selection, removal) are also supported for flexibility.

🔌 API Endpoints & Required JSON Formats
The frontend communicates with a backend API at https://your-backend-api.com/api. All endpoints must support CORS and return appropriate HTTP status codes.

1. GET /classes
Purpose: Fetch list of available classes.
Response (200 OK):
```
"Class V", "Class VI", "Class VII"
```
2. GET /sections
Purpose: Fetch list of available sections.
Response (200 OK):
json
```
["A", "B", "C"]
```
3. GET /sessions
Purpose: Fetch list of academic sessions.
Response (200 OK):
json


1
["2024–2025", "2025–2026"]
4. GET /students?class={name}&section={name}&session={name}
Purpose: Fetch students filtered by class, section, and session.
Query Parameters:
class (string, required)
section (string, required)
session (string, required)
Response (200 OK):
json


[
  {
    "id": 1,
    "name": "Alice Johnson",
    "roll": "01",
    "adm": "ADM1001",
    "class": "Class V",
    "section": "A",
    "session": "2024–2025",
    "rfid": "123456"
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "roll": "02",
    "adm": "ADM1002",
    "class": "Class V",
    "section": "A",
    "session": "2024–2025",
    "rfid": null
  }
]
Note: rfid is a string if assigned, or null if unassigned. 

5. POST /assignments/
Purpose: Assign an RFID card to a student.
Request Body:
json


1
2
3
4
⌄
{
  "user_id": 2,
  "card": "987654"
}
user_id: integer (student ID from /students response)
card: string or integer (RFID value — frontend sends as string)
Success Response (201 Created):
json


1
{ "id": 101, "user_id": 2, "card": "987654", "created_at": "2024-06-01T10:00:00Z" }
Error Response (400/409):
json


1
{ "detail": "RFID already assigned" }
6. GET /assignments/user/{user_id}
Purpose: Retrieve assignment(s) for a specific student (used before deletion).
Response (200 OK):
json


1
2
3
⌄
[
  { "id": 101, "user_id": 2, "card": "987654", "created_at": "2024-06-01T10:00:00Z" }
]
7. DELETE /assignments/{assignment_id}
Purpose: Remove an RFID assignment from a student.
Success Response (200 OK):
json


1
{ "message": "Assignment deleted" }
🧩 Frontend Requirements Summary
Initial Load
Fetch
/classes
,
/sections
,
/sessions
Student Load
Only after user selects all 3 filters + clicks
Search
Auto-Assign
On RFID input (debounced), assign to next unassigned student
Duplicate Guard
Block assignment if RFID already exists in current student list
Manual Actions
Search by name/roll/adm, double-click to select, remove RFID
Error Handling
Show toast for network errors, validation failures

💡 Note: The frontend currently uses client-side filtering for "Assigned"/"Unassigned" views. For large datasets, consider moving this to the backend. 
