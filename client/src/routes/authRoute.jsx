import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/routePath";
import { useSelector } from "react-redux";

const AuthRoute = () => {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken && !user) return <Outlet />;

  return <Navigate to={PROTECTED_ROUTES.OVERVIEW} replace />;
};

export default AuthRoute;