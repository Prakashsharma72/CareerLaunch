import { useState } from "react";
import {
  FaRoad,
  FaCalendarAlt,
  FaProjectDiagram,
  FaBookOpen,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function RoadmapGenerator() {
  const [careerPath, setCareerPath] =
    useState("MERN Stack Developer");

  const [experienceLevel, setExperienceLevel] =
    useState("Beginner");

  const [loading, setLoading] =
    useState(false);

  const [roadmap, setRoadmap] =
    useState(null);

  const handleGenerateRoadmap = async () => {
    try {
      setLoading(true);

      // Replace with Gemini API later

      const dummyRoadmap = {
        title: "MERN Stack Developer Roadmap",

        duration: "6 Months",

        months: [
          {
            month: "Month 1",
            topics: [
              "HTML",
              "CSS",
              "JavaScript Basics",
              "Git & GitHub",
            ],
          },

          {
            month: "Month 2",
            topics: [
              "Advanced JavaScript",
              "ES6+",
              "DOM",
              "Async JavaScript",
            ],
          },

          {
            month: "Month 3",
            topics: [
              "React Basics",
              "Hooks",
              "React Router",
              "State Management",
            ],
          },

          {
            month: "Month 4",
            topics: [
              "Node.js",
              "Express.js",
              "REST APIs",
              "Authentication",
            ],
          },

          {
            month: "Month 5",
            topics: [
              "PostgreSQL",
              "Database Design",
              "Joins",
              "Indexes",
            ],
          },

          {
            month: "Month 6",
            topics: [
              "Full Stack Projects",
              "Deployment",
              "Interview Prep",
              "Resume Building",
            ],
          },
        ],

        projects: [
          "Todo App",
          "Blog Platform",
          "E-commerce Website",
          "CareerLaunch AI",
        ],

        skills: [
          "React",
          "Node.js",
          "Express",
          "PostgreSQL",
          "JWT",
          "Git",
          "REST API",
        ],
      };

      setTimeout(() => {
        setRoadmap(dummyRoadmap);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          AI Roadmap Generator
        </h1>

        <p className="text-gray-600 mt-2">
          Generate a personalized learning roadmap
          based on your career goal.
        </p>

      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-xl p-6">

        <h2 className="text-xl font-semibold mb-5">
          Select Career Goal
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {/* Career Path */}
          <div>

            <label className="block mb-2 font-medium">
              Career Path
            </label>

            <select
              value={careerPath}
              onChange={(e) =>
                setCareerPath(e.target.value)
              }
              className="
                w-full
                border
                rounded-lg
                p-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option>
                MERN Stack Developer
              </option>

              <option>
                React Developer
              </option>

              <option>
                Java Developer
              </option>

              <option>
                Full Stack Developer
              </option>

              <option>
                Python Developer
              </option>

              <option>
                DevOps Engineer
              </option>
            </select>

          </div>

          {/* Level */}
          <div>

            <label className="block mb-2 font-medium">
              Experience Level
            </label>

            <select
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(e.target.value)
              }
              className="
                w-full
                border
                rounded-lg
                p-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>
            </select>

          </div>

        </div>

        <button
          onClick={handleGenerateRoadmap}
          className="
            mt-6
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-blue-700
          "
        >
          Generate Roadmap
        </button>

      </div>

      {/* Roadmap Result */}
      {roadmap && (
        <div className="mt-8 space-y-6">

          {/* Title */}
          <div className="bg-white shadow rounded-xl p-6">

            <div className="flex items-center gap-3">

              <FaRoad className="text-blue-600 text-2xl" />

              <div>
                <h2 className="text-2xl font-bold">
                  {roadmap.title}
                </h2>

                <p className="text-gray-600">
                  Duration: {roadmap.duration}
                </p>
              </div>

            </div>

          </div>

          {/* Monthly Plan */}
          <div className="bg-white shadow rounded-xl p-6">

            <div className="flex items-center gap-3 mb-6">

              <FaCalendarAlt className="text-green-600 text-xl" />

              <h2 className="text-2xl font-semibold">
                Learning Timeline
              </h2>

            </div>

            <div className="space-y-6">

              {roadmap.months.map(
                (monthData, index) => (
                  <div
                    key={index}
                    className="
                    border
                    rounded-lg
                    p-5
                  "
                  >
                    <h3 className="font-bold text-lg mb-3">
                      {monthData.month}
                    </h3>

                    <div className="flex flex-wrap gap-2">

                      {monthData.topics.map(
                        (topic, idx) => (
                          <span
                            key={idx}
                            className="
                            bg-blue-100
                            text-blue-700
                            px-3
                            py-1
                            rounded-full
                          "
                          >
                            {topic}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* Projects */}
          <div className="bg-white shadow rounded-xl p-6">

            <div className="flex items-center gap-3 mb-4">

              <FaProjectDiagram className="text-purple-600 text-xl" />

              <h2 className="text-2xl font-semibold">
                Recommended Projects
              </h2>

            </div>

            <ul className="space-y-3">

              {roadmap.projects.map(
                (project, index) => (
                  <li
                    key={index}
                    className="
                    bg-gray-100
                    p-3
                    rounded-lg
                  "
                  >
                    {project}
                  </li>
                )
              )}

            </ul>

          </div>

          {/* Skills */}
          <div className="bg-white shadow rounded-xl p-6">

            <div className="flex items-center gap-3 mb-4">

              <FaBookOpen className="text-orange-600 text-xl" />

              <h2 className="text-2xl font-semibold">
                Skills To Master
              </h2>

            </div>

            <div className="flex flex-wrap gap-3">

              {roadmap.skills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="
                    bg-green-100
                    text-green-700
                    px-4
                    py-2
                    rounded-full
                  "
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default RoadmapGenerator;