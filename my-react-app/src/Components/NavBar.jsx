import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-black bg-opacity-90 text-purple-300 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]">
          Gemu
        </h1>
        
        <div className="flex-1 flex justify-center space-x-12 text-lg font-medium">
          <Link
            to="/"
            className="hover:text-white transition duration-300"
          >
             Home
          </Link>
          <Link
            to="/reviews"
            className="hover:text-white transition duration-300"
          >
            Reviews
          </Link>
          <Link
            to="/create"
            className="hover:text-white transition duration-300"
          >
            Create
          </Link>
          <Link
            to="/profile"
            className="hover:text-white transition duration-300"
          >
             Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
