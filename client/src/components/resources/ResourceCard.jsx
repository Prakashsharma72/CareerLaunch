import {
  FaBook,
  FaExternalLinkAlt,
  FaBookmark,
} from "react-icons/fa";

function ResourceCard({
  resource,
  onBookmark,
}) {
  return (
    <div
      className="
      bg-white
      rounded-xl
      shadow-md
      border
      p-6
      hover:shadow-lg
      transition
      duration-300
    "
    >
      {/* Category */}
      <div className="flex justify-between items-center">

        <span
          className="
          bg-blue-100
          text-blue-700
          px-3
          py-1
          rounded-full
          text-sm
          font-medium
        "
        >
          {resource.category}
        </span>

        <button
          onClick={() => onBookmark(resource.id)}
          className="
          text-gray-500
          hover:text-blue-600
          transition
        "
        >
          <FaBookmark size={18} />
        </button>
      </div>

      {/* Title */}
      <div className="mt-4 flex items-center gap-3">

        <FaBook
          className="text-blue-600"
          size={22}
        />

        <h2
          className="
          text-xl
          font-bold
          text-gray-800
        "
        >
          {resource.title}
        </h2>

      </div>

      {/* Description */}
      <p
        className="
        mt-4
        text-gray-600
        leading-relaxed
      "
      >
        {resource.description}
      </p>

      {/* Footer */}
      <div
        className="
        mt-6
        flex
        justify-between
        items-center
      "
      >
        <span
          className="
          text-sm
          text-gray-500
        "
        >
          Added by Admin
        </span>

        <a
          href={resource.link}
          target="_blank"
          rel="noreferrer"
          className="
          bg-green-600
          text-white
          px-4
          py-2
          rounded-lg
          flex
          items-center
          gap-2
          hover:bg-green-700
          transition
        "
        >
          Open

          <FaExternalLinkAlt
            size={12}
          />
        </a>
      </div>
    </div>
  );
}

export default ResourceCard;