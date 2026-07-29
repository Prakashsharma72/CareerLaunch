# 🚀 CareerLaunch – AI Career Platform

CareerLaunch is a full-stack AI-powered career guidance platform designed to help students and freshers get jobs faster. It provides job listings, learning resources, resume analysis, mock interviews, and AI-powered career assistance.

---

## ✨ Features

### 👨‍🎓 Student Features
- 🔍 Browse and apply for jobs
- 📚 Access learning resources
- 💾 Save jobs
- 🤖 AI Resume Analyzer
- 🧠 AI Mock Interview system
- 🗺️ Roadmap Generator
- 👤 User profile management

### 🧑‍💼 Admin Features
- 📌 Manage job postings
- 📚 Manage resources
- 👥 Manage users

### 🤖 AI Features
- ChatGPT-powered career assistant
- Resume feedback system
- Interview preparation bot
- Personalized career guidance

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- Sequelize ORM

### Database
- MySQL (Database: `careerlaunch`)

### AI Integration
- OpenAI GPT API

---

## 📁 Project Structure

client/
│
├── public/
│
├── src/
│
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── jobs/
│   │   │   ├── JobCard.jsx
│   │   │   └── JobFilter.jsx
│   │   │
│   │   ├── resources/
│   │   │   └── ResourceCard.jsx
│   │   │
│   │   └── dashboard/
│   │       └── DashboardCard.jsx
│
│   ├── pages/
│   │
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── SavedJobs.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   ├── RoadmapGenerator.jsx
│   │   │   └── MockInterview.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManageJobs.jsx
│   │   │   ├── ManageResources.jsx
│   │   │   └── ManageUsers.jsx
│   │   │
│   │   ├── Home.jsx
│   │   └── NotFound.jsx
│
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── AdminLayout.jsx
│
│   ├── redux/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── jobSlice.js
│   │   ├── resourceSlice.js
│   │   └── aiSlice.js
│
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── jobService.js
│   │   ├── resourceService.js
│   │   └── aiService.js
│
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useJobs.js
│
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatDate.js
│
│   ├── App.jsx
│   └── main.jsx
│
└── package.json







server/
│
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   └── dotenv.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── job.controller.js
│   ├── resource.controller.js
│   └── ai.controller.js
│
├── models/
│   ├── user.model.js
│   ├── job.model.js
│   ├── resource.model.js
│   └── chat.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── job.routes.js
│   ├── resource.routes.js
│   └── ai.routes.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── error.middleware.js
│   └── upload.middleware.js
│
├── services/
│   ├── auth.service.js
│   ├── job.service.js
│   ├── resource.service.js
│   └── ai.service.js
│
├── utils/
│   ├── generateToken.js
│   ├── apiResponse.js
│   ├── apiError.js
│   └── logger.js
│
├── validators/
│   ├── auth.validator.js
│   ├── job.validator.js
│   └── resource.validator.js
│
├── ai/
│   ├── openaiClient.js
│   ├── prompts.js
│   └── aiHelpers.js
│
├── constants/
│   ├── roles.js
│   ├── jobTypes.js
│   └── statusCodes.js
│
├── app.js
├── server.js
├── package.json
└── .env


---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Prakashsharma72/CareerLaunch
cd careerlaunch
