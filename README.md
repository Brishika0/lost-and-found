# FYP Lost & Found System

A comprehensive lost and found management system for ING Colleges Network with separate portals for students, admins, and super admins.

## Features

### Super Admin Portal
- Manage all colleges in the network
- Add/remove college administrators
- View system-wide statistics
- Monitor all lost items across colleges
- View all students across the network

### Admin Portal
- Manage college-specific lost items
- View college students
- Update item status (Lost → Found → Claimed)
- College-specific dashboard and statistics

### Student Portal
- Report lost items
- Search for found items
- Claim found items
- View personal lost/found history

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled for frontend communication

### Frontend
- React.js with Vite
- CSS3 for styling
- Hash-based routing
- Responsive design

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - The `.env` file is already created with default values
   - Update `MONGO_URI` if using a different MongoDB connection
   - Change `JWT_SECRET` for production use

4. Seed the database with initial data:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Default Login Credentials

After running the seed script, you can use these credentials:

### Super Admin
- Email: `superadmin@ing.edu.np`
- Password: `superadmin123`

### Sample Admin Accounts
- **Herald College**: `admin@heraldcollege.edu.np` / `admin123`
- **Islington College**: `admin@islington.edu.np` / `admin123`
- **IIC**: `admin@iic.edu.np` / `admin123`

### Sample Student Accounts
- **Herald Student**: `john.doe@heraldcollege.edu.np` / `student123`
- **Islington Student**: `jane.smith@islington.edu.np` / `student123`
- **IIC Student**: `mike.johnson@iic.edu.np` / `student123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/students` - College students
- `GET /api/admin/lost-items` - College lost items
- `PUT /api/admin/lost-items/:id/status` - Update item status

### Super Admin Routes
- `GET /api/superadmin/dashboard` - Super admin dashboard
- `GET /api/superadmin/colleges` - All colleges
- `POST /api/superadmin/colleges` - Add new college
- `POST /api/superadmin/admins` - Add new admin
- `DELETE /api/superadmin/admins/:id` - Remove admin
- `GET /api/superadmin/students` - All students
- `GET /api/superadmin/lost-items` - All lost items

## Database Models

### User Model
- Supports three roles: `student`, `admin`, `superadmin`
- Encrypted passwords using bcryptjs
- College association for admins and students

### College Model
- College information with admin assignment
- Logo and domain management

### LostItem Model
- Comprehensive item tracking
- Status management (Lost → Found → Claimed)
- User associations for reporting, finding, and claiming

## Project Structure

```
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Main server file
│   ├── seedData.js      # Database seeding script
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── services/    # API service layer
│   │   ├── components/  # React components
│   │   └── styles/      # CSS files
│   └── public/          # Static assets
└── README.md
```

## Development Notes

- The system uses JWT tokens for authentication
- All passwords are hashed using bcryptjs
- CORS is configured to allow frontend-backend communication
- The frontend uses hash-based routing for simplicity
- MongoDB connection is configured for local development

## Next Steps

1. Implement student portal functionality
2. Add image upload for lost items
3. Implement email notifications
4. Add search and filtering capabilities
5. Implement real-time updates using WebSockets
6. Add data export functionality
7. Implement audit logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.