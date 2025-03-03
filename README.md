# **Apply Archive - Job Application Tracker** 🎯

A **free & open-source job application tracker** to organize your job search efficiently!  
Track applications, store resumes, search/filter jobs, and **never lose track of your applications again!**  

🚀 **Live Demo**: [Apply Archive](https://grand-mousse-e7c7c9.netlify.app)  
⭐ **Star the Repo**: [GitHub Repository](https://github.com/manishtulabandu/apply-archive)

---

## **✨ Features**
✔️ **Track Job Applications** – Store company names, job descriptions, dates, and statuses  
✔️ **Resume & Cover Letter Management** – Upload and organize documents  
✔️ **Search & Filter** – Quickly find applications by company name or role  
✔️ **Dual Storage Support** – Use **LocalStorage (no backend)** or **MongoDB (persistent storage)**  
✔️ **Intuitive UI** – Clean, minimal UI built with React & Tailwind CSS  
✔️ **Fully Responsive** – Works on desktops, tablets, and mobile devices  

---

## **📺 Screenshots**
| Dashboard View | Add Application | Search & Filter |
|---------------|----------------|----------------|
| ![Dashboard](./assets/dashboard.png) | ![Add Job](./assets/add-job.png) | ![Search](./assets/search-filter.png) |

---

## **💠 Storage Modes**
This application works in two modes:
1. **LocalStorage Mode** (Frontend-only, no setup required)
2. **MongoDB Mode** (Persistent storage, requires backend setup)

---

## **🚀 Installation Guide**
### **1️⃣ Prerequisites**
Ensure you have the following installed:
- **[Node.js](https://nodejs.org/)** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (optional, only for persistent storage)

### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/manishtulabandu/apply-archive.git
cd apply-archive
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file in the root directory and copy the content from `.env.example`:
```sh
MONGODB_URI=mongodb://localhost:27017/applyarchive
VITE_MONGODB_URI=true
VITE_API_URL=http://localhost:5001/api
PORT=5001
```

---

## **🎯 Running the Application**
### **🔥 Quick Start (Both Frontend & Backend)**
Run everything with **one command**:
```sh
node start-app.js
```
💪 **Backend**: http://localhost:5001  
💪 **Frontend**: http://localhost:8080  

### **📌 LocalStorage Mode (Frontend Only)**
If you don’t want to set up a database, run:
```sh
npm run dev
```
💪 **Available at**: http://localhost:8080  

### **📁 MongoDB Mode (Persistent Storage)**
Start the backend:
```sh
node server.js
```
Then, start the frontend:
```sh
npm run dev
```

---

## **🛠 API Endpoints (MongoDB Mode)**
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/applications` | Get all job applications |
| **POST** | `/api/applications` | Create a new application |
| **PUT** | `/api/applications/:id` | Update an application |
| **DELETE** | `/api/applications/:id` | Delete an application |
| **GET** | `/api/health` | Check API and MongoDB connection |

---

## **💽 Project Structure**
```
apply-archive/
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── server.js             # Express backend
├── start-app.js          # Start script (Frontend + Backend)
├── src/                  # Frontend source
│   ├── App.tsx           # Main component
│   ├── components/       # UI components
│   ├── lib/              # Utilities
│   ├── pages/            # App pages
│   ├── types/            # TypeScript types
│   └── vite.config.ts    # Vite config
└── README.md             # This file!
```

---

## **🌍 Contributing**
Want to contribute? Follow these steps:

1. **Fork the repository** 🍞
2. Clone your fork:
   ```sh
   git clone https://github.com/yourusername/apply-archive.git
   ```
3. Create a new branch:
   ```sh
   git checkout -b feature/your-feature
   ```
4. Commit changes:
   ```sh
   git add .
   git commit -m "Added a new feature"
   ```
5. Push & create a **Pull Request**! 🚀

---

## **📝 License**
This project is licensed under the **MIT License** – free to use, modify, and share!  
Check the [LICENSE](./LICENSE) file for details.

---

## **⭐ Support & Share**
- **If you like this project, give it a ⭐ on GitHub!**  
- **Share with job seekers & friends** to help them manage their applications!**  
- **Follow for updates! 🚀**  

