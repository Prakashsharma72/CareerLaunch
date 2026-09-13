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
      bg-[var(--cl-page)]
      px-6
      text-center
      text-[var(--cl-text)]
    "
    >
      <h1
        className="
        text-8xl
        font-bold
        text-[var(--cl-primary)]
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
        text-[var(--cl-text-muted)]
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
        bg-[var(--cl-primary)]
        text-white
        px-6
        py-3
        rounded-lg
        hover:bg-[var(--cl-primary-strong)]
      "
      >
        <FaHome />
        Back To Home
      </Link>

    </div>
  );
}

export default NotFound;