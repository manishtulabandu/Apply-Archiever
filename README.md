# Apply Archive - Job Application Tracker

Apply Archive is a comprehensive job application tracking tool designed to help job seekers organize their job search process. It allows you to store company information, application details, upload resumes and cover letters, and keep track of your progress.

## Features

- **Comprehensive Job Tracking**: Store all details about your job applications in one place
- **Resume & Cover Letter Management**: Upload and organize your documents
- **Dual Storage Support**: Choose between MongoDB (persistent) or localStorage (temporary)
- **Search & Filter**: Easily find applications by company name or details
- **User-friendly Interface**: Clean UI built with React and Tailwind CSS
- **Responsive Design**: Works on desktops, tablets, and mobile devices

## Storage Modes

The application is designed to work in two modes:

1. **LocalStorage Mode**: Uses browser's localStorage for data storage (no backend required)
2. **MongoDB Mode**: Uses MongoDB for persistent storage (requires backend configuration)

## Dependencies

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- TanStack React Query
- React Router
- Zod (form validation)
- Shadcn/UI components
- Lucide React (icons)
- React Hook Form
- Recharts (for visualizations)

### Backend

- Node.js
- Express
- MongoDB / MongoDB Atlas
- CORS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, only for persistent storage)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/apply-archive.git
cd apply-archive
```

2. **Install dependencies**

```bash
npm install
```

3. **Configuration**

Create a `.env` file in the root directory using `.env.example` as a template:

```bash
# MongoDB connection string (required for database mode)
MONGODB_URI=mongodb://localhost:27017/applyarchive

# Frontend environment variables
VITE_MONGODB_URI=true
VITE_API_URL=http://localhost:5001/api

# Server port
PORT=5001
```

## Running the Application

### Quick Start (Both Frontend and Backend)

Use the start script to run both servers simultaneously:

```bash
node start-app.js
```

This will start:

- Backend server at http://localhost:5001
- Frontend development server at http://localhost:8080

### Manual Start (Separate Servers)

#### LocalStorage Mode (Frontend Only)

```bash
npm run dev
```

The app will use localStorage for data storage and be available at http://localhost:8080.

#### MongoDB Mode (Backend + Frontend)

1. Start the backend server:

```bash
node server.js
```

2. In a separate terminal, start the frontend:

```bash
npm run dev
```

## MongoDB Setup Guide

### Installing MongoDB (Community Edition)

#### For Windows:

1. Download the MongoDB installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. MongoDB will be installed as a service that runs automatically

#### For macOS:

Using Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### For Linux (Ubuntu):

```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Setting Up MongoDB Compass (GUI Tool)

1. Download MongoDB Compass from [MongoDB Download Center](https://www.mongodb.com/try/download/compass)
2. Install and open Compass
3. Connect to your MongoDB instance:
   - For local development: `mongodb://localhost:27017`
   - Click "Connect"
4. You should see the `applyarchive` database created automatically when you first use the application

## GitHub Repository

### Creating Your Own Repository

1. Create a new repository on GitHub (without initializing with README, .gitignore, or license)
2. Initialize your local repository and push the code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/apply-archive.git
git push -u origin main
```

### Contributing to This Project

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/yourusername/apply-archive.git
```

3. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes and commit:

```bash
git add .
git commit -m "Add your feature"
```

5. Push to your fork:

```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request from your fork on GitHub

## File Structure

```
apply-archive/
├── .env                  # Environment variables (create this manually)
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
├── server.js             # Express backend server for MongoDB mode
├── start-app.js          # Script to run both frontend and backend
├── src/                  # Frontend source code
│   ├── App.tsx           # Main application component
│   ├── components/       # UI components
│   │   ├── application-card.tsx      # Displays a job application
│   │   ├── application-form.tsx      # Form to add/edit applications
│   │   ├── empty-state.tsx           # Shown when no applications exist
│   │   └── ui/                       # Shadcn UI components
│   ├── lib/              # Utility functions and services
│   │   ├── file-utils.ts             # File handling utilities
│   │   ├── mongodb-client.ts         # MongoDB client interface
│   │   ├── storage.ts                # Storage abstraction layer
│   │   └── utils.ts                  # General utilities
│   ├── pages/            # Application pages
│   │   ├── Index.tsx                 # Main page with applications list
│   │   └── NotFound.tsx              # 404 page
│   └── types/            # TypeScript type definitions
│       └── index.ts                  # Types for job applications
└── vite.config.ts        # Vite configuration
```

## API Reference

When running in MongoDB mode, the following API endpoints are available:

- `GET /api/applications` - Get all job applications
- `POST /api/applications` - Create a new job application
- `PUT /api/applications/:id` - Update an existing job application
- `DELETE /api/applications/:id` - Delete a job application
- `GET /api/health` - Check the API and MongoDB connection status

## Troubleshooting

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Check that MongoDB is running (`mongod` process)
2. Verify your connection string in `.env`
3. Try connecting with MongoDB Compass to test the connection
4. Check the API health endpoint: http://localhost:5001/api/health

### CORS Errors

If you see CORS errors in the console:

1. Ensure both backend and frontend are running
2. Verify that the `VITE_API_URL` in `.env` matches your backend URL
3. Check that the API server is running on the expected port

## License

This project is licensed under the MIT License - see the LICENSE file for details.
