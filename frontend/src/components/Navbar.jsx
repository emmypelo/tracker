import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkAuthApi, logoutApi } from "../APIrequests/userAPI";
import { login, logout } from "../redux/slices/authSlices";

const Navbar = () => {
  const dispatch = useDispatch();
  const { userAuth } = useSelector((state) => state.auth);

  const logoutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutApi,
  });

  const { data: authData } = useQuery({
    queryKey: ["checkauth"],
    queryFn: checkAuthApi,
  });

  useEffect(() => {
    if (authData) {
      dispatch(login(authData));
    }
  }, [authData, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const name =
    userAuth?.data?.firstname + " " + userAuth?.data?.lastname.slice(0, 1);

  return (
    <nav className="w-full h-16 fixed top-0 bg-gray-900 z-10 flex items-center justify-between px-6">
      <div>
        <h2 className="text-white">LOGO</h2>
      </div>
      <div className="CTA">
        <ul className="text-white flex gap-4">
          <li>
            <Link to="/" className="hover:text-gray-400">
              Home
            </Link>
          </li>
          <li>
            <Link to="/new-request" className="hover:text-gray-400">
              New Request
            </Link>
          </li>
          <li>
            <Link to="/my-requests" className="hover:text-gray-400">
              My Requests
            </Link>
          </li>
          <li>
            <Link to="/reports" className="hover:text-gray-400">
              Reports
            </Link>
          </li>
        </ul>
      </div>
      <div className="auth">
        {userAuth ? (
          <div className="flex gap-2">
            {" "}
            <p className="text-white">{name}</p>
            <p
              onClick={handleLogout}
              className="transition-all px-1  font-semibold text-slate-100 duration-300 ease-in-out hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              Logout
            </p>
          </div>
        ) : (
          <Link
            to="/signin"
            className="transition-all rounded-full px-2 py-1 text-sm font-semibold text-slate-100 duration-500 ease-in-out hover:bg-slate-700 hover:text-white"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
