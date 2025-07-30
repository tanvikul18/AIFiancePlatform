
import { Navigate, Outlet } from "react-router-dom";
import { AUTH_ROUTES } from "./common/routePath";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
 
  const { accessToken, user } = useSelector((state) => state.auth);
 
  if (accessToken && user) return <Outlet />;

  return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
};

export default ProtectedRoute;
