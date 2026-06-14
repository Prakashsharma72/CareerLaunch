import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/db.js";
import Job from "../models/job.model.js";

const sampleJobs = [
  {
    title: "Frontend Engineer",
    company: "Google",
    description:
      "Build scalable frontend systems using React and TypeScript. Work on Google's next-generation web applications.",
    location: "Mountain View, CA",
    salary: "$120,000 - $160,000",
    type: "Full-time",
  },
  {
    title: "Backend Developer",
    company: "Microsoft",
    description:
      "Develop robust backend services using Node.js and Azure. Shape the future of cloud computing.",
    location: "Redmond, WA",
    salary: "$130,000 - $170,000",
    type: "Full-time",
  },
  {
    title: "Data Analyst Intern",
    company: "Amazon",
    description:
      "Analyze large datasets and create insights. Work with AWS analytics tools and SQL.",
    location: "Seattle, WA",
    salary: "$50,000 - $70,000",
    type: "Internship",
  },
  {
    title: "Full Stack Developer",
    company: "Infosys",
    description:
      "Develop end-to-end web applications. Work on cutting-edge technologies and enterprise clients.",
    location: "Bangalore, India",
    salary: "$40,000 - $60,000",
    type: "Full-time",
  },
  {
    title: "React Developer",
    company: "Accenture",
    description:
      "Build interactive user interfaces for Fortune 500 companies. Master modern frontend frameworks.",
    location: "Remote",
    salary: "$70,000 - $100,000",
    type: "Full-time",
  },
  {
    title: "Software Engineer Fresher",
    company: "TCS",
    description:
      "Start your career with India's leading IT company. Comprehensive training and mentorship provided.",
    location: "Hyderabad, India",
    salary: "$25,000 - $35,000",
    type: "Full-time",
  },
];

const seedJobs = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database authenticated");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");

    await Job.truncate();
    console.log("✅ Cleared existing jobs");

    await Job.bulkCreate(sampleJobs);
    console.log("✅ Seeded 6 sample jobs");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedJobs();
