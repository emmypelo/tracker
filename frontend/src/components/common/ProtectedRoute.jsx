import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { userAuth, isLoading } = useSelector((state) => state.auth);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return <Loading />;
  }

  // Check if the user is authenticated
  if (!userAuth || userAuth.status !== "success" || !userAuth.data) {
    return <Navigate to="/signin" replace />;
  }

  // Render the outlet for nested routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
