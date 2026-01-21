# VulnReport Pro - Backend API

RESTful API backend for VulnReport Pro vulnerability reporting platform, built with Node.js, Express, and MySQL.

## Features

### 🔐 Authentication
- Password-based authentication with JWT tokens
- User registration and login
- Role-based access control (User/Admin)
- Profile completion
- Token validation middleware

### 📊 Report Management
- Submit vulnerability reports with file attachments
- View personal reports (users)
- View all reports (admins)
- Update report status (admins)
- Delete reports (owners/admins)

### 📈 Analytics
- Comprehensive reporting statistics
- Reports by status and type
- Monthly trend analysis
- Recent activity tracking

### 🛡️ Security
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation
- File upload security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet.js, Rate Limiting

## Installation

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Setup

1. **Clone and install dependencies**:
```bash
cd vulnreport-backend
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vulnreport_db
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
```

3. **Initialize database**:
```bash
npm run init-db
```

4. **Start the server**:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Setup

### Automatic Setup
Run the database initialization script:
```bash
npm run init-db
```

This will:
- Create the database and tables
- Insert default admin user:
  - **Email**: vipingiribgb0@gmail.com
  - **Password**: Xyz99@123

### Manual Setup
Import `database.sql` in phpMyAdmin:
1. Open phpMyAdmin at `http://localhost:8080/phpmyadmin`
2. Create database `vulnreport_db`
3. Import the `database.sql` file

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /profile` - Complete user profile

### Reports (`/api/reports`)
- `POST /` - Submit new report (authenticated)
- `GET /` - Get all reports (admin only)
- `GET /user` - Get user's reports (authenticated)
- `PATCH /:id/status` - Update report status (admin only)
- `DELETE /:id` - Delete report (owner/admin)
- `GET /attachments/:filename` - Serve uploaded files

### Analytics (`/api/analytics`)
- `GET /` - Get analytics data (admin only)

### System
- `GET /api/health` - Health check

## Default Admin Credentials

**Email**: vipingiribgb0@gmail.com  
**Password**: Xyz99@123

⚠️ **Important**: Change the default admin password after first login!

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## File Upload

- **Max file size**: 10MB per file
- **Max files**: 5 per report
- **Allowed types**: Images (jpg, png, gif), Videos (mp4, avi, mov), Documents (pdf, doc, docx, txt)
- **Storage**: Local `uploads/` directory

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Input validation and sanitization
- File type validation

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=vulnreport_db
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Testing with Frontend

1. Start the backend server:
```bash
npm run dev
```

2. Update frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Start the frontend:
```bash
cd ../vulnreport-frontend
npm run dev
```

4. Access the application at `http://localhost:3000`

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `nickname` - Display name
- `full_name` - Full name
- `about` - User bio
- `experience` - Security experience
- `role` - user/admin
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

### Vulnerability Reports Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `domain` - Target domain
- `affected_url` - Vulnerable URL
- `vulnerability_type` - Type of vulnerability
- `steps_to_reproduce` - Reproduction steps
- `impact` - Impact description
- `proof_of_concept` - PoC details
- `admin_comment` - Admin notes
- `status` - Report status
- `submitted_at` - Submission timestamp
- `updated_at` - Last update timestamp

### Report Attachments Table
- `id` - Primary key
- `report_id` - Foreign key to reports
- `filename` - Stored filename
- `original_name` - Original filename
- `file_size` - File size in bytes
- `mime_type` - MIME type
- `uploaded_at` - Upload timestamp

## License

MIT License
