import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
