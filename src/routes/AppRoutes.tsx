import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";
import CreatorListPage from "../pages/CreatorListpage";
import TransactionsPage from "../pages/TransactionPage";
import PortfolioPage from "../pages/PortfolioPage";

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
      { path: "", element: <CreatorListPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "portfolio", element: <PortfolioPage /> }
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default router;
