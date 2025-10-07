# AssignPage Implementation

## Overview

This document details the implementation of the RFID assignment page for the attendance system. It allows administrators to assign RFID cards to students and manage these assignments.

## API Endpoints Used

### Assignment Endpoints
- `POST /api/assignments/` - Assign an RFID card to a student
- `DELETE /api/assignments/{id}` - Remove an RFID assignment
- `GET /api/assignments/user/{user_id}` - Get assignment for a specific user

### Data Endpoints
- `GET /api/sessions/` - Retrieve session data
- `GET /api/classes/` - Retrieve class data
- `GET /api/sections/` - Retrieve section data
- `GET /api/students/` - Retrieve student data (with optional query parameters)

## API Request/Response Formats

### Assign RFID to Student
**Request:**
```json
{
  "user_id": 1,
  "card": 123456
}
```

**Response:**
```json
{
  "message": "Assignment created successfully",
  "assignment_id": 1
}
```

### Student Data Structure
**Response:**
```json
[
  {
    "id": 1,
    "name": "John Smith",
    "roll_no": "01",
    "admission_no": "ADM000001",
    "class": {
      "id": 1,
      "name": "I"
    },
    "section": {
      "id": 1,
      "name": "A"
    },
    "session": {
      "id": 1,
      "name": "2024-2025"
    },
    "rfid": "123456"
  }
]
```

### Session Data Structure
**Response:**
```json
[
  {
    "id": 1,
    "name": "2024-2025"
  },
  {
    "id": 2,
    "name": "2025-2026"
  }
]
```

### Class Data Structure
**Response:**
```json
[
  {
    "id": 1,
    "name": "I"
  },
  {
    "id": 2,
    "name": "II"
  },
  {
    "id": 3,
    "name": "III"
  }
]
```

### Section Data Structure
**Response:**
```json
[
  {
    "id": 1,
    "name": "A"
  },
  {
    "id": 2,
    "name": "B"
  }
]
```

## Filter Parameters

The student endpoint accepts query parameters:
- `class_id` - Filter by class ID
- `section` - Filter by section name
- `session_id` - Filter by session ID

**Example Request:**
```
GET /api/students/?class_id=1&section=A&session_id=1
```

## Component Flow

1. Load dropdown options (sessions, classes, sections) from API
2. Load students based on selected filters
3. Allow RFID scanning for assignment
4. Handle manual student selection
5. Display assignment status and allow removal

## Status Messages

- Success: Green checkmark with success message
- Error: Red warning with error message
- Information: Yellow info icon

## Search Functionality

The page supports searching students by:
- Name
- Roll number
- Admission number

## Filtering Options

Users can filter students by:
- Class (using class ID)
- Section (using section name)
- Session (using session ID)
- Assignment status (All, Assigned, Unassigned)

## State Management

### Component State
- `students`: Array of student objects
- `classes`: Array of class objects `{id, name}`
- `sections`: Array of section names
- `sessions`: Array of session objects `{id, name}`
- `classSel`: Selected class ID
- `sectionSel`: Selected section name
- `sessionSel`: Selected session ID
- `filter`: Current filter status ('all', 'assigned', 'unassigned')
- `rfid`: Current RFID input
- `status`: Current status message
- `loading`: Loading state indicator
- `selectedStudent`: Currently selected student
- `searchTerm`: Current search term

### Refs
- `inputRef`: Ref for RFID input field
- `searchRef`: Ref for search input field
- `rfidTimeoutRef`: Ref for RFID input timeout
- `studentsRef`: Ref for current student list
- `selectedStudentRef`: Ref for currently selected student
- `rfidRef`: Ref for current RFID value
- `nextUnassignedIndexRef`: Ref for tracking next unassigned student

## API Error Handling

The component implements comprehensive error handling:
- Shows user-friendly error messages
- Continues operation after errors
- Properly handles network failures
- Validates RFID inputs before assignment

## User Interaction Flow

1. User selects filters (class, section, session)
2. Students list updates based on filters
3. User can search for specific students
4. User can double-click to select a student
5. User scans RFID card
6. System assigns card to selected student or first unassigned
7. Success/error messages are displayed
8. User can remove assignments using the remove button