import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Use the new logo

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <header className="bg-indigo-100 shadow-sm w-full">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        {/* Bigger Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Creator Market Logo"
            className="h-10 sm:h-12 w-24 object-contain"
          />
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-white-700 hover:text-pink-500 transition duration-150"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
