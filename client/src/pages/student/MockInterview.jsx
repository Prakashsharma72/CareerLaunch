import { useState } from "react";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
} from "react-icons/fa";

function MockInterview() {
  const [role, setRole] =
    useState("MERN Stack Developer");

  const [difficulty, setDifficulty] =
    useState("Beginner");

  const [started, setStarted] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const startInterview = () => {
    setStarted(true);

    setMessages([
      {
        sender: "ai",
        text: "Welcome to the mock interview. Tell me about yourself.",
      },
    ]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");

    // Dummy AI Response
    setTimeout(() => {
      const aiResponse = {
        sender: "ai",
        text: "What is the difference between React State and Props?",
      };

      setMessages((prev) => [
        ...prev,
        aiResponse,
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          AI Mock Interview
        </h1>

        <p className="text-gray-600 mt-2">
          Practice interviews with AI and
          improve your confidence.
        </p>

      </div>

      {!started ? (
        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-xl font-semibold mb-5">
            Interview Setup
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* Role */}
            <div>

              <label className="block mb-2 font-medium">
                Select Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="
                  w-full
                  border
                  rounded-lg
                  p-3
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
                  Node.js Developer
                </option>
              </select>

            </div>

            {/* Difficulty */}
            <div>

              <label className="block mb-2 font-medium">
                Difficulty Level
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded-lg
                  p-3
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
            onClick={startInterview}
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
            Start Interview
          </button>

        </div>
      ) : (
        <>
          {/* Interview Info */}
          <div
            className="
            bg-white
            shadow
            rounded-xl
            p-4
            mb-6
          "
          >
            <div className="flex gap-8">

              <div>
                <span className="font-semibold">
                  Role:
                </span>{" "}
                {role}
              </div>

              <div>
                <span className="font-semibold">
                  Level:
                </span>{" "}
                {difficulty}
              </div>

            </div>
          </div>

          {/* Chat Area */}
          <div
            className="
            bg-white
            shadow
            rounded-xl
            h-[500px]
            overflow-y-auto
            p-6
            space-y-4
          "
          >
            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[75%]
                      p-4
                      rounded-xl
                      flex
                      gap-3
                      ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100"
                      }
                    `}
                  >
                    {msg.sender === "ai" ? (
                      <FaRobot />
                    ) : (
                      <FaUser />
                    )}

                    <p>{msg.text}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Input Area */}
          <div
            className="
            bg-white
            shadow
            rounded-xl
            p-4
            mt-4
          "
          >
            <div className="flex gap-3">

              <input
                type="text"
                placeholder="Type your answer..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="
                  flex-1
                  border
                  rounded-lg
                  p-3
                "
              />

              <button
                onClick={sendMessage}
                className="
                  bg-blue-600
                  text-white
                  px-5
                  rounded-lg
                  hover:bg-blue-700
                "
              >
                <FaPaperPlane />
              </button>

            </div>
          </div>

          {/* End Interview */}
          <div className="mt-4">

            <button
              onClick={() => {
                setStarted(false);
                setMessages([]);
              }}
              className="
                bg-red-500
                text-white
                px-5
                py-3
                rounded-lg
                hover:bg-red-600
              "
            >
              End Interview
            </button>

          </div>
        </>
      )}

    </div>
  );
}

export default MockInterview;