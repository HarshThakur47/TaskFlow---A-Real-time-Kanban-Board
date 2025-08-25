# TaskFlow Backend Server

A real-time collaborative Kanban board backend built with Node.js, Express, MongoDB, and Socket.IO.

## Features

- **Real-time Collaboration**: Live updates using Socket.IO
- **Authentication**: JWT-based user authentication
- **Board Management**: Create, read, update, delete boards
- **List Management**: Organize tasks into lists
- **Card Management**: Create, move, and manage cards
- **Drag & Drop**: Real-time card movement between lists
- **Comments**: Add comments to cards
- **Member Management**: Add team members to boards

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `config.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

3. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your config file

4. **Run the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Boards

- `POST /api/boards` - Create a new board (Protected)
- `GET /api/boards` - Get all user's boards (Protected)
- `GET /api/boards/:id` - Get single board with lists and cards (Protected)
- `PUT /api/boards/:id` - Update board (Protected)
- `DELETE /api/boards/:id` - Delete board (Protected)
- `POST /api/boards/:id/lists` - Add list to board (Protected)
- `POST /api/boards/:id/members` - Add member to board (Protected)

### Cards

- `POST /api/cards` - Create a new card (Protected)
- `PUT /api/cards/:id` - Update card (Protected)
- `DELETE /api/cards/:id` - Delete card (Protected)
- `POST /api/cards/:id/comments` - Add comment to card (Protected)
- `PUT /api/cards/move` - Move card (drag & drop) (Protected)

## Socket.IO Events

### Client to Server

- `join-board` - Join a board room
- `card:move` - Move a card
- `list:create` - Create a new list
- `card:create` - Create a new card

### Server to Client

- `board:update` - Board data updated
- `error` - Error message

## Database Models

### User
- `username` (String, required, unique)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `avatar` (String, optional)

### Board
- `title` (String, required)
- `description` (String, optional)
- `owner` (ObjectId, ref: User)
- `members` (Array of ObjectId, ref: User)
- `background` (String, default: '#0079bf')
- `isPublic` (Boolean, default: false)

### List
- `title` (String, required)
- `board` (ObjectId, ref: Board)
- `position` (Number, for ordering)
- `cards` (Array of ObjectId, ref: Card)

### Card
- `title` (String, required)
- `description` (String, optional)
- `list` (ObjectId, ref: List)
- `board` (ObjectId, ref: Board)
- `position` (Number, for ordering)
- `assignees` (Array of ObjectId, ref: User)
- `dueDate` (Date, optional)
- `labels` (Array of objects with name and color)
- `comments` (Array of comment objects)
- `attachments` (Array of attachment objects)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Board access control (owner/member only)

## Real-time Features

- Live card movement updates
- Instant list creation
- Real-time card creation
- Collaborative editing
- User presence tracking

## Error Handling

- Comprehensive error handling for all routes
- Validation errors with detailed messages
- Socket.IO error handling
- Database error handling

## Development

The server runs on port 5000 by default. Make sure MongoDB is running before starting the server.

For production deployment, update the CORS origins in the Socket.IO configuration and use environment variables for sensitive data.
