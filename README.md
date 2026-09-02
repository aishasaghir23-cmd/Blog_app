# WhatsApp Style Chat App

A full-stack real-time one-to-one messaging web application built with the MERN stack and Socket.IO. Designed and implemented to match the WhatsApp Web interface.

**Course:** MERN + Socket.IO  
**Institution:** University of Gujrat, Hayyatian Computing Society  
**Instructor:** Kamran Ahsan  

---

## Tech Stack

* **Frontend:** React JS (with Vite)
* **Backend:** Node.js with Express
* **Database:** MongoDB with Mongoose
* **Real-time Engine:** Socket.IO (`socket.io` server & `socket.io-client` browser)
* **Authentication:** JWT stored in `httpOnly` Cookie

---

## Features Implemented

1. **Authentication:** User registration, login, and logout backed by JWT stored in secure `httpOnly` cookies.
2. **Protected Routes:** Authentication middleware prevents unauthorized access to the chat workspace.
3. **Filtered User List:** Displays all registered users excluding the currently logged-in user.
4. **Live Online User Count:** Real-time online counter in the sidebar header updated dynamically.
5. **Online Status Indicator:** Green status dot displayed on user avatars when they are online.
6. **Chat History Persistence:** Automatically loads past chat messages from MongoDB when selecting a user.
7. **Instant Messaging:** Real-time two-way messaging with zero page refreshes using Socket.IO.
8. **Unread Message Counter:** Displays a green badge for unread messages received from each user.
9. **Automatic Read Receipts:** Unread badge resets to 0 and updates message status upon opening the chat window.
10. **Responsive Layout:** Optimized interface for mobile and desktop screens.

---

## Socket.IO Events Reference

| Event Name | Direction | Data Payload | Functionality |
|---|---|---|---|
| `connection` | Browser → Server | *(Cookie)* | Server validates JWT cookie and registers user as online |
| `disconnect` | Browser → Server | *None* | Removes user from online list once all open tabs are closed |
| `online:count` | Server → All Browsers | `Number` | Broadcasts current total online user count |
| `chat:history` | Browser → Server | `otherUserId` | Requests message history; server responds with array (oldest first) |
| `chat:send` | Browser → Server | `{ to, text }` | Persists message in MongoDB and emits to recipient |
| `chat:message` | Server → Both Browsers | `Message Object` | Delivers new message payload instantly to sender and receiver |
| `chat:unread` | Browser → Server | *None* | Fetches initial array of unread message counts per user `[{ userId, count }]` |
| `chat:read` | Browser → Server | `otherUserId` | Marks chat messages as read in MongoDB and clears unread counter |
| `chat:unread:update` | Server → One Browser | `{ userId, count }` | Emits updated unread count badge for a specific user |
| `chat:typing` | Browser → Server → Browser | `{ to }` | Temporarily broadcasts active typing status indicator |

---

## How to Run the Application

### Prerequisites
* Node.js installed on your machine
* MongoDB running locally or a MongoDB Atlas URI

### 1. Setup Server
```bash
cd server
npm install
cp .env.example .env
npm run dev

