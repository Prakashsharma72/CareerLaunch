import { useState } from "react";

function Profile() {
  const [profile, setProfile] = useState({
    name: "Prakash Sharma",
    email: "prakash@gmail.com",
    phone: "",
    education: "",
    skills: "",
    resumeUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log("Profile Data:", profile);

      // API Call Here

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* Page Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="text-gray-600 mt-2">
          Manage your personal information
        </p>

      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-xl p-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Name */}
          <div>
            <label className="block font-medium mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-2">
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Education */}
          <div>
            <label className="block font-medium mb-2">
              Education
            </label>

            <textarea
              rows="4"
              name="education"
              value={profile.education}
              onChange={handleChange}
              placeholder="B.Tech Computer Science..."
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block font-medium mb-2">
              Skills
            </label>

            <textarea
              rows="3"
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              placeholder="React, Node.js, PostgreSQL..."
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Resume URL */}
          <div>
            <label className="block font-medium mb-2">
              Resume URL
            </label>

            <input
              type="text"
              name="resumeUrl"
              value={profile.resumeUrl}
              onChange={handleChange}
              placeholder="Paste Cloudinary Resume URL"
              className="
              w-full
              border
              rounded-lg
              p-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            />
          </div>

          {/* Resume Preview */}
          {profile.resumeUrl && (
            <div>

              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="
                text-blue-600
                underline
              "
              >
                View Uploaded Resume
              </a>

            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-blue-700
          "
          >
            {loading
              ? "Updating..."
              : "Update Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;