##  How the Page Works
On load, the page fetches all classes, sections, and sessions to populate the filters. The admin selects a class, section, and session, then clicks “Search Students” to load the student list. RFIDs can be scanned or entered to automatically assign them to the next unassigned student, with duplicates prevented. Assigned RFIDs are stored in state and can be saved to the backend. Clicking “Remove” clears a student’s RFID without deleting their record. The search box allows quick highlighting by name, roll, or admission number.

```
 GET /api/classes
 Purpose: Return list of classes
 Response (200 OK):

[
  { "id": 1, "name": "Class V" },
  { "id": 2, "name": "Class VI" }
]
```
## 2. GET /api/sections
Purpose: Return all sections (used for filtering; frontend uses section name, not ID)
Response (200 OK):
```
[
  { "id": 1, "name": "A", "class_id": 1 },
  { "id": 2, "name": "B", "class_id": 1 }
]
```
 🔹 Note: Frontend does not filter sections by class — it just shows all section names. So section names should be unique across the system (e.g., no two "A" sections in different classes), or your /students endpoint must correctly handle class+section combo. 

 ## 3. GET /api/sessions
 Purpose: Return academic sessions
Response (200 OK):
```
[
  { "id": 1, "name": "2024–2025" },
  { "id": 2, "name": "2025–2026" }
]
```
## 4. GET /api/students?class=Class%20V&section=A&session=2024%E2%80%932025
Purpose: Fetch students by class name, section name, and session name (all as URL-encoded strings)
Response (200 OK):
```[
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
```
 ✅ Must include all 8 fields: id, name, roll, adm, class, section, session, rfid .
✅ rfid = string (if assigned) or null (if not)
✅ class, section, session = strings (names), not IDs 

## 5. POST /api/assignments/
Purpose: Assign RFID to a student
Request Body:
```{
  "user_id": 2,
  "card": "987654"
}
Success (201 Created):
{
  "id": 101,
  "user_id": 2,
  "card": "987654",
  "created_at": "2024-06-01T10:00:00Z"
}
Error (409 Conflict or 400 Bad Request):
{
  "detail": "RFID already assigned"
}
```
## 6. PUT /api/remove-rfid/{student_id}
Purpose: Remove RFID from a student
Request Body:
```{
  "rfid": null
}
Success (200 OK):
{
  "success": true,
  "message": "RFID removed successfully",
  "student_id": 2
}
```