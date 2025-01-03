import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ManagementLayout = () => {
  const { userAuth } = useSelector((state) => state.auth);
  const authenticated = userAuth.status == "success";
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authenticated) {
      navigate("/signin");
    }
  }, [authenticated, navigate]);

  return (
    <div className="flex h-full">
      <nav className="w-64 bg-gray-100 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manage/addcategory"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              Add Category
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manage/reportcategory"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              Report Category
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manage/addstation"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              Add Station
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manage/addregion"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              Add Region
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="flex-grow p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagementLayout;
