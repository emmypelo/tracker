"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { checkAuthApi, logoutApi } from "../../APIrequests/userAPI";
import { login, logout } from "../../redux/slices/authSlices";
import {
  LogOut,
  User,
  Menu,
  Home,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";
import logo from '../../images/logo.png'


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { userAuth } = useSelector((state) => state.auth);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const logoutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutApi,
    retry: false,
  });

  const { data: authData, isLoading: isCheckingAuth } = useQuery({
    queryKey: ["checkauth"],
    queryFn: checkAuthApi,
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isCheckingAuth && authData) {
      dispatch(login(authData));
    } else if (!isCheckingAuth && !authData) {
      dispatch(logout());
    }
  }, [authData, isCheckingAuth, dispatch]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    dispatch(logout());
    setIsOpen(false);
  };

  const name = userAuth?.data
    ? `${userAuth.data.firstname.slice(0, 1)}${userAuth.data.lastname.slice(
        0,
        1
      )}`
    : "";

  const menuVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.5,
      },
    },
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5,
      },
    },
  };

  const navItems = [
    { path: "/", label: "Requests", icon: Home },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/manage", label: "Manage", icon: Settings },
  ];

  return (
    <nav className="fixed top-0 z-40 flex h-16 w-full items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-4 shadow-lg backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full w-[12%] items-center"
      >
        <img
          src={logo}
          alt="logo"
          className="max-h-full max-w-full object-contain filter drop-shadow-lg"
        />
      </motion.div>

      {!isCheckingAuth && (
        <>
          {/* Desktop Navigation */}
          <div className="hidden md:flex w-[40%] lg:w-[20%] justify-center">
            <ul className="flex w-full justify-between text-lg text-white">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gray-700/50 hover:text-yellow-400"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Section with Auth and Menu */}
          <div className="flex items-center gap-4">
            {/* Auth Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              {userAuth?.data ? (
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg"
                  >
                    <User className="text-gray-900" size={20} />
                    <span className="sr-only">{name}</span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 rounded-full bg-gray-700/50 px-4 py-2 transition-all duration-300 hover:bg-gray-700"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut
                      size={18}
                      className="text-white transition-colors group-hover:text-yellow-400"
                    />
                    <span className="text-sm font-medium text-white transition-colors group-hover:text-yellow-400">
                      Logout
                    </span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signin"
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-2 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:shadow-yellow-400/20"
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center gap-2 rounded-lg p-2 text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <Menu size={24} />
                
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
                className="fixed right-0 w-44 bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl md:hidden"
                style={{ top: "4rem" }}
              >
                <div className="h-full p-4 border-l border-gray-700/50">
                  <ul className="flex flex-col gap-4 text-lg text-white">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          className="flex items-center gap-3 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700/50 active:bg-gray-600/50"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon size={18} />
                          <span>{item.label}</span>
                          <ChevronRight
                            size={16}
                            className="ml-auto opacity-50"
                          />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </nav>
  );
}
