import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

function NotFound() {
  return (
    <div
      className="
      min-h-screen
      flex
      flex-col
      justify-center
      items-center
      bg-gray-100
      px-6
      text-center
    "
    >
      <h1
        className="
        text-8xl
        font-bold
        text-blue-600
      "
      >
        404
      </h1>

      <h2
        className="
        text-3xl
        font-semibold
        mt-4
      "
      >
        Page Not Found
      </h2>

      <p
        className="
        text-gray-600
        mt-4
        max-w-md
      "
      >
        The page you are looking for does not
        exist or has been moved.
      </p>

      <Link
        to="/"
        className="
        mt-8
        inline-flex
        items-center
        gap-2
        bg-blue-600
        text-white
        px-6
        py-3
        rounded-lg
        hover:bg-blue-700
      "
      >
        <FaHome />
        Back To Home
      </Link>

    </div>
  );
}

export default NotFound;