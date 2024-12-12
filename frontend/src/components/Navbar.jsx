
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkAuthApi, logoutApi } from "../APIrequests/userAPI";
import { login, logout } from "../redux/slices/authSlices";
import logo from "../images/logo.png";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

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
    userAuth?.data?.firstname.slice(0, 1) +
    " " +
    userAuth?.data?.lastname.slice(0, 1);

  return (
    <nav className="w-full h-[4.5rem] fixed top-0 bg-gray-800 z-10 flex items-center justify-between px-4">
      <div className="h-full w-[12%] flex items-center">
        <img
          src={logo}
          alt="logo"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="CTA w-[70%] lg:w-[20%] md:w-[40%] mx-auto flex justify-center ">
        <ul className="text-white flex justify-center md:justify-between gap-4 w-full text-base md:text-lg">
          <li>
            <Link to="/" className="hover:text-gray-400">
              Requests
            </Link>
          </li>
          <li>
            <Link to="/reports" className="hover:text-gray-400">
              Reports
            </Link>
          </li>
          <li>
            <Link to="/addcategory" className="hover:text-gray-400">
              Category
            </Link>
          </li>
        </ul>
      </div>
      <div className="auth w-1/5 flex justify-end items-center">
        {userAuth ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 rounded-full border border-yellow-500 w-[3rem] h-[3rem] justify-center">
              <FaUser fill="white" />
              <p className="text-white">{name}</p>
            </div>
            <div
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleLogout}
            >
              <FaSignOutAlt fill="white" />
              <p className="text-slate-100 group-hover:text-yellow-300 transition duration-300 ease-in-out">
                Logout
              </p>
            </div>
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
