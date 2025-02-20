import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import StatCard from "./StatCard";
import RegionCharts from "./charts/RegionCharts";
import ReportDistributionChart from "./charts/ReportDistributionChart";
import TopIssuesStations from "./charts/TopIssuesStations";

const ManagementLayout = () => {
  const { userAuth } = useSelector((state) => state.auth);
  const authenticated = userAuth.status === "success";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authenticated) {
      navigate("/signin");
    }
  }, [authenticated, navigate]);

  const navLinkClass = ({ isActive, isPending }) =>
    `block p-2 rounded ${
      isActive
        ? "bg-blue-500 text-white"
        : isPending
        ? "bg-blue-200 text-gray-700"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  const navItems = [
    { to: "/manage", text: "Overview", end: true },
    { to: "/manage/addcategory", text: "Task Category" },
    { to: "/manage/reportcategory", text: "Report Category" },
    { to: "/manage/addstation", text: "Add Station" },
    { to: "/manage/addregion", text: "Add Region" },
    { to: "/manage/categories", text: "Manage Categories" },
    { to: "/manage/stations", text: "All Stations" },
  ];

  const isOverview = location.pathname === "/manage";

  return (
    <div className="flex h-auto relative ">
      {/* Sidebar Navigation */}
      <nav className="w-46 bg-gray-100 p-4 fixed top-[4.5rem] left-0 h-full">
        <ul className="space-y-2 text-left">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass} end={item.end}>
                {item.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow  mt-3 px-2 ml-[12rem]">
        {isOverview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="stationsdata flex flex-col w-full mx-auto  rounded-xl items-start min-h-[calc(100vh-6rem)]"
          >
            <div className="flex flex-col justify-center items-center w-full">
              <h1 className="text-gray-800 text-2xl font-bold pt-2">
                Overview
              </h1>
              <div className="flex justify-center w-full ">
                <div className="grid grid-cols-4 gap-4 p-2">
                  <StatCard title="Stations" value="186" />
                  <StatCard title="Regions" value="6" />
                  <StatCard title="Completed Tasks" value="1,024" />
                  <StatCard title="Unresolved Reports" value="12" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="w-full flex flex-col lg:flex-row gap-2 justify-around mb-8 ">
              <RegionCharts />
              <ReportDistributionChart />
            </div>
            <div className="w-full flex flex-col lg:flex-row gap-2 justify-around">
              <TopIssuesStations />
            </div>
          </motion.div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ManagementLayout;
