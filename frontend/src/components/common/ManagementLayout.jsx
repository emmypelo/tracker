"use client";

import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  ChevronLast,
  ChevronFirst,
  Home,
  List,
  FileText,
  MapPin,
  Globe,
  Folder,
  Building,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "./StatCard";
import RegionCharts from "./charts/RegionCharts";
import ReportDistributionChart from "./charts/ReportDistributionChart";
import TopIssuesStations from "./charts/TopIssuesStations";
import { fetchStationsApi } from "../../APIrequests/stationsAPI";
import { fetchRegionsApi } from "../../APIrequests/regionAPI";
import { fetchReportsApi } from "../../APIrequests/reportAPI";
const SidebarItem = ({ icon, text, active, alert, expanded, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ml-3`}
        style={{ width: expanded ? "13rem" : "0" }}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  );
};

const Sidebar = ({ children, expanded, setExpanded }) => {
  return (
    <aside className="h-screen fixed left-0 top-[4.0rem] z-40">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm ">
        <div className="p-4 pb-2 flex justify-between items-center">
          <h1
            className={`overflow-hidden transition-all`}
            style={{ width: expanded ? "5rem" : "0" }}
          >
            Dashboard
          </h1>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <ul className="flex-1 px-3 text-left ">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              
              onClick: () => setExpanded(false),
            })
          )}
        </ul>
      </nav>
    </aside>
  );
};

const ManagementLayout = () => {
  const { userAuth } = useSelector((state) => state.auth);
  const authenticated = userAuth.status === "success";
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      navigate("/signin");
    }
  }, [authenticated, navigate]);
  const { data: stationsData } = useQuery({
    queryKey: ["fetchStations"],
    queryFn: fetchStationsApi,
    keepPreviousData: true,
  });
  const { data: regionsData } = useQuery({
    queryKey: ["fetchRegions"],
    queryFn: fetchRegionsApi,
    keepPreviousData: true,
  });
  const { data: reportsData } = useQuery({
    queryKey: ["fetchReports"],
    queryFn: fetchReportsApi,
    keepPreviousData: true,
  });

  const stations = stationsData?.data.stations || [];
  const regions = regionsData?.data.regions || [];
  const reports = reportsData?.data.reports || [];
  const isOverview = location.pathname === "/manage";

  const navItems = [
    { to: "/manage", text: "Overview", icon: <Home size={20} />, end: true },
    {
      to: "/manage/addcategory",
      text: "Task Category",
      icon: <List size={20} />,
    },
    {
      to: "/manage/reportcategory",
      text: "Report Category",
      icon: <FileText size={20} />,
    },
    {
      to: "/manage/addstation",
      text: "Add Station",
      icon: <MapPin size={20} />,
    },
    { to: "/manage/addregion", text: "Add Region", icon: <Globe size={20} /> },
    {
      to: "/manage/categories",
      text: "Manage Categories",
      icon: <Folder size={20} />,
    },
    {
      to: "/manage/stations",
      text: "All Stations",
      icon: <Building size={20} />,
    },
  ];

  return (
    <div className="flex h-auto relative">
      <Sidebar expanded={expanded} setExpanded={setExpanded}>
        {navItems.map((item) => (
          <NavLink to={item.to} key={item.to} end={item.end}>
            {({ isActive }) => (
              <SidebarItem
                icon={item.icon}
                text={item.text}
                active={isActive}
                expanded={expanded}
                onClick={() => setExpanded(false)}
              />
            )}
          </NavLink>
        ))}
      </Sidebar>

      {/* Main Content */}
      <div className="flex-grow mt-3 px-2 ml-[4rem]">
        {isOverview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="stationsdata flex flex-col w-full mx-auto rounded-xl items-start min-h-[calc(100vh-6rem)]"
          >
            <div className="flex flex-col justify-center items-center w-full">
              <h1 className="text-gray-800 text-2xl font-bold pt-2">
                Overview
              </h1>
              <div className="flex justify-center w-full mb-4">
                <div className="grid grid-cols-3 gap-3 p-1">
                  <StatCard title="Stations" value={stations.length} />
                  <StatCard title="Regions" value={regions.length} />
                  <StatCard title="Unresolved Reports" value={reports.length} />
                </div>
              </div>
            </div>
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
