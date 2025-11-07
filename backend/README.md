# AppStore Screenshot Creator - Backend API

Backend API server for the AppStore Screenshot Creator application. Provides comprehensive backend services for screenshot processing, image rendering, cloud storage, and user management.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🖼️ **Image Processing** - Server-side rendering with Puppeteer and image optimization with Sharp
- 📦 **Cloud Storage** - AWS S3 integration with local storage fallback
- ⚡ **Job Queue System** - Redis-backed Bull queue for background processing
- 🎨 **Template Management** - Custom and system templates
- 📊 **Project Management** - Multi-project support with version control
- 🚀 **Export System** - Batch export with multiple presets
- 💾 **PostgreSQL Database** - Robust data persistence
- 🔒 **Rate Limiting** - Redis-based rate limiting per endpoint
- 📈 **User Statistics** - Storage tracking and usage analytics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache/Queue**: Redis 6+
- **ORM**: Sequelize
- **Image Processing**: Puppeteer, Sharp
- **Storage**: AWS S3 (with local fallback)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- AWS S3 account (optional, local storage fallback available)

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=screenshot_creator
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
```

### 3. Setup Database

Create the PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE screenshot_creator;
\q
```

Run migrations (auto-runs on first start in development):

```bash
npm run migrate
```

### 4. Start Redis

Make sure Redis is running:

```bash
redis-server
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Production Mode

```bash
npm start
```

### Start Background Worker

The export worker processes background jobs:

```bash
npm run worker
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Project Endpoints

#### List Projects
```http
GET /api/projects?page=1&limit=20&status=active
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My App Screenshots",
  "description": "Screenshots for my mobile app",
  "templateId": "uuid-here"
}
```

#### Get Project
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### Screenshot Endpoints

#### Upload Screenshots
```http
POST /api/screenshots/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

projectId: uuid-here
images: file1.png, file2.png
```

#### Update Screenshot Config
```http
PUT /api/screenshots/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": {
    "backgroundColor": "#ffffff",
    "deviceFrame": "iphone",
    "textTop": "Amazing App"
  }
}
```

### Export Endpoints

#### Create Export Job
```http
POST /api/exports
Authorization: Bearer <token>
Content-Type: application/json

{
  "screenshotIds": ["uuid1", "uuid2"],
  "exportType": "batch",
  "exportSettings": {
    "format": "png",
    "quality": 90,
    "width": 1290,
    "height": 2796,
    "scale": 2
  },
  "exportPreset": "iPhone 6.7\""
}
```

#### Check Export Status
```http
GET /api/exports/:id
Authorization: Bearer <token>
```

#### Download Export
```http
GET /api/exports/:id/download
Authorization: Bearer <token>
```

### Template Endpoints

#### List Templates
```http
GET /api/templates?category=minimal&sortBy=usageCount
```

#### Get Template
```http
GET /api/templates/:id
```

#### Create Custom Template
```http
POST /api/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Custom Template",
  "category": "custom",
  "config": { ... },
  "isPublic": false
}
```

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/users/stats
Authorization: Bearer <token>
```

#### Get Storage Info
```http
GET /api/users/storage
Authorization: Bearer <token>
```

## Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── database/        # Database connection
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── workers/         # Background job workers
│   └── server.js        # Main server file
├── storage/             # Local storage (if not using S3)
├── temp/                # Temporary files
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

### Services

#### Image Processing Service
- Server-side rendering with Puppeteer
- Image optimization with Sharp
- Thumbnail generation
- Filter application
- Batch processing

#### Storage Service
- AWS S3 integration
- Local storage fallback
- File upload/download
- Signed URLs
- File deletion

#### Queue Service
- Export job queue
- Image processing queue
- Cleanup queue
- Job status tracking
- Retry logic

#### Auth Service
- User registration/login
- JWT token generation
- Password hashing
- Password reset
- Email verification

## Queue System

The application uses Bull with Redis for background job processing:

- **Export Queue**: Processes screenshot export jobs
- **Image Queue**: Processes image optimization and thumbnails
- **Cleanup Queue**: Cleans up expired files

Start the worker to process queued jobs:

```bash
npm run worker
```

## Storage

### AWS S3 (Recommended)

Configure AWS credentials in `.env`:

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
```

### Local Storage (Fallback)

If AWS is not configured, files will be stored locally:

```env
LOCAL_STORAGE_PATH=./storage
```

## Rate Limiting

Rate limits per endpoint type:

- **General API**: 100 requests per 15 minutes
- **Auth**: 5 attempts per 15 minutes
- **Export**: 10 exports per hour
- **Upload**: 20 uploads per hour

Premium users have 10x higher limits.

## Database Models

- **User**: User accounts and authentication
- **Project**: Screenshot projects
- **Screenshot**: Individual screenshots with config
- **Template**: Template configurations
- **ExportJob**: Export job tracking

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation with express-validator
- Helmet.js security headers
- CORS configuration
- Storage quota enforcement

## Development

### Database Migrations

```bash
npm run migrate
```

### Seed Database

```bash
npm run seed
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Setup Redis cluster
5. Configure AWS S3
6. Setup SSL/TLS
7. Configure reverse proxy (nginx)

### Process Management

Use PM2 for process management:

```bash
pm2 start src/server.js --name screenshot-api
pm2 start src/workers/exportWorker.js --name screenshot-worker
```

### Monitoring

- Setup logging (Winston, Morgan)
- Configure error tracking (Sentry)
- Monitor queue status
- Track storage usage
- Setup alerts for failures

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -h localhost
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

### Puppeteer Issues

Install required dependencies:

```bash
# Ubuntu/Debian
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
