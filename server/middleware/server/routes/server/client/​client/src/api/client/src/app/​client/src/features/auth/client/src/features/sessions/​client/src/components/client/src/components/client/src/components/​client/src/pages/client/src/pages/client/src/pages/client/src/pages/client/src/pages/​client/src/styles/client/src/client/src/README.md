# SkillTrack — Session Log App

A full-stack session logging application built using React, Redux Toolkit, Express.js, and MongoDB.

## Features
- **Authentication**: Local client-side authentication with session persistence using `localStorage`.
- **Protected Routes**: Navigation restrictions for unauthenticated users.
- **Redux State Management**: Centralized management for sessions and authentication using thunks.
- **RESTful API**: Express server connected to MongoDB with complete CRUD capabilities and validation rules.

## Setup Instructions

### 1. Server Setup
```bash
cd server
npm install
npm run dev
