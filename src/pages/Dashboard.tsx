import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
          Welcome, {user?.displayName} 👋
        </h2>
        <div className="flex items-center gap-4 mb-6">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full border border-gray-200"
            />
          )}
          <div>
            <p className="font-medium text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-500">UID: {user?.uid}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
