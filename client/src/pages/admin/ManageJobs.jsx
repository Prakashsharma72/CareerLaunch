import { useEffect, useState } from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState(null);

  const [formData, setFormData] =
    useState({
      title: "",
      company: "",
      location: "",
      jobType: "",
      salary: "",
      description: "",
      skills: "",
    });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      // Replace with API later
      const dummyJobs = [
        {
          id: 1,
          title: "React Developer",
          company: "Google",
          location: "Pune",
          jobType: "Full Time",
          salary: "8 LPA",
        },
        {
          id: 2,
          title: "MERN Developer",
          company: "Infosys",
          location: "Bangalore",
          jobType: "Internship",
          salary: "4 LPA",
        },
      ];

      setJobs(dummyJobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingJob(null);

    setFormData({
      title: "",
      company: "",
      location: "",
      jobType: "",
      salary: "",
      description: "",
      skills: "",
    });

    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);

    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      description:
        job.description || "",
      skills:
        job.skills || "",
    });

    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingJob) {
      const updatedJobs =
        jobs.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                ...formData,
              }
            : job
        );

      setJobs(updatedJobs);

      alert(
        "Job Updated Successfully"
      );
    } else {
      const newJob = {
        id: Date.now(),
        ...formData,
      };

      setJobs([
        newJob,
        ...jobs,
      ]);

      alert(
        "Job Added Successfully"
      );
    }

    setShowModal(false);
  };

  const handleDeleteJob = (
    jobId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this job?"
      );

    if (!confirmDelete) return;

    const updatedJobs =
      jobs.filter(
        (job) =>
          job.id !== jobId
      );

    setJobs(updatedJobs);

    alert(
      "Job Deleted Successfully"
    );
  };

  const filteredJobs =
    jobs.filter((job) =>
      job.title
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div
        className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-4
        mb-8
      "
      >
        <div>
          <h1 className="text-3xl font-bold">
            Manage Jobs
          </h1>

          <p className="text-gray-600 mt-2">
            Create, update and
            delete jobs.
          </p>
        </div>

        <button
          onClick={
            openAddModal
          }
          className="
          bg-blue-600
          text-white
          px-5
          py-3
          rounded-lg
          flex
          items-center
          gap-2
          hover:bg-blue-700
        "
        >
          <FaPlus />
          Add Job
        </button>
      </div>

      {/* Search */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        p-5
        mb-6
      "
      >
        <div className="relative">

          <FaSearch
            className="
            absolute
            top-4
            left-4
            text-gray-500
          "
          />

          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="
            w-full
            border
            rounded-lg
            py-3
            pl-12
            pr-4
          "
          />

        </div>
      </div>

      {/* Jobs Table */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        overflow-x-auto
      "
      >
        <table className="w-full">

          <thead>
            <tr
              className="
              bg-gray-100
              text-left
            "
            >
              <th className="p-4">
                Title
              </th>

              <th className="p-4">
                Company
              </th>

              <th className="p-4">
                Location
              </th>

              <th className="p-4">
                Type
              </th>

              <th className="p-4">
                Salary
              </th>

              <th className="p-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {filteredJobs.map(
              (job) => (
                <tr
                  key={job.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {job.title}
                  </td>

                  <td className="p-4">
                    {job.company}
                  </td>

                  <td className="p-4">
                    {job.location}
                  </td>

                  <td className="p-4">
                    {job.jobType}
                  </td>

                  <td className="p-4">
                    {job.salary}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          openEditModal(
                            job
                          )
                        }
                        className="
                        text-blue-600
                      "
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteJob(
                            job.id
                          )
                        }
                        className="
                        text-red-600
                      "
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>
                </tr>
              )
            )}

          </tbody>

        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="
          fixed
          inset-0
          bg-black/50
          flex
          justify-center
          items-center
          z-50
        "
        >

          <div
            className="
            bg-white
            w-full
            max-w-2xl
            rounded-xl
            p-6
          "
          >

            <div
              className="
              flex
              justify-between
              items-center
              mb-6
            "
            >
              <h2 className="text-2xl font-bold">
                {editingJob
                  ? "Edit Job"
                  : "Add Job"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >

              <input
                type="text"
                name="title"
                placeholder="Job Title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
                required
              />

              <input
                type="text"
                name="company"
                placeholder="Company"
                value={
                  formData.company
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={
                  formData.location
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
                required
              />

              <input
                type="text"
                name="jobType"
                placeholder="Job Type"
                value={
                  formData.jobType
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
                required
              />

              <input
                type="text"
                name="salary"
                placeholder="Salary"
                value={
                  formData.salary
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
              />

              <textarea
                rows="4"
                name="description"
                placeholder="Job Description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
              />

              <textarea
                rows="3"
                name="skills"
                placeholder="Skills Required"
                value={
                  formData.skills
                }
                onChange={
                  handleChange
                }
                className="
                w-full
                border
                p-3
                rounded-lg
              "
              />

              <button
                type="submit"
                className="
                bg-blue-600
                text-white
                px-5
                py-3
                rounded-lg
                hover:bg-blue-700
              "
              >
                {editingJob
                  ? "Update Job"
                  : "Create Job"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default ManageJobs;