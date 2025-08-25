# TaskFlow - Real-time Collaborative Kanban Board

A modern, real-time collaborative project management tool built with React, Node.js, and Socket.IO. TaskFlow provides a Trello-like experience with instant updates, drag-and-drop functionality, and team collaboration features.

![TaskFlow Screenshot](https://via.placeholder.com/800x400/0079bf/ffffff?text=TaskFlow+Kanban+Board)

## 🚀 Features

### Core Functionality
- **Real-time Collaboration**: Live updates using Socket.IO
- **Drag & Drop**: Smooth card movement between lists
- **Board Management**: Create, organize, and manage multiple boards
- **List Organization**: Organize tasks into customizable lists
- **Card Details**: Rich card information with descriptions, due dates, and labels

### Team Features
- **User Authentication**: Secure JWT-based authentication
- **Member Management**: Add team members to boards
- **Role-based Access**: Owner and member permissions
- **Real-time Notifications**: Instant updates for all team members

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Optimistic Updates**: Instant UI feedback for better UX
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **React Beautiful DnD** - Drag and drop functionality
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `server/config.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## 🏗️ Project Structure

```
taskflow/
├── server/                 # Backend server
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config.env         # Environment variables
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
└── package.json           # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - Get user's boards
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/lists` - Add list to board
- `POST /api/boards/:id/members` - Add member to board

### Cards
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/comments` - Add comment
- `PUT /api/cards/move` - Move card (drag & drop)

## 🔌 Socket.IO Events

### Client to Server
- `join-board` - Join board room
- `card:move` - Move card
- `list:create` - Create list
- `card:create` - Create card

### Server to Client
- `board:update` - Board data updated
- `error` - Error message

## 🎨 Key Features Implementation

### Real-time Updates
The application uses Socket.IO for real-time communication. When a user performs an action (like moving a card), the change is:
1. Optimistically updated in the UI
2. Sent to the server via Socket.IO
3. Broadcasted to all other users in the same board
4. Persisted to the database

### Drag and Drop
React Beautiful DnD provides smooth drag and drop functionality:
- Cards can be dragged between lists
- Visual feedback during dragging
- Optimistic updates for instant response
- Server synchronization for consistency

### State Management
Redux Toolkit manages application state:
- User authentication state
- Board and card data
- UI state (modals, notifications)
- Real-time updates integration

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create a Render account** and connect your repository
2. **Create a new Web Service**
3. **Configure environment variables**:
   ```
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```
4. **Set build command**: `cd server && npm install`
5. **Set start command**: `cd server && npm start`

### Frontend Deployment (Vercel)

1. **Create a Vercel account** and connect your repository
2. **Set root directory** to `client`
3. **Configure environment variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
   ```
4. **Deploy**

### Database Setup

1. **MongoDB Atlas** (Recommended for production):
   - Create a free cluster
   - Get connection string
   - Add to environment variables

2. **Local MongoDB** (Development):
   - Install MongoDB locally
   - Start MongoDB service
   - Use `mongodb://localhost:27017/taskflow`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for API validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) for drag and drop functionality
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Socket.IO](https://socket.io/) for real-time communication
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**TaskFlow** - Making project management collaborative and real-time! 🚀
