"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import logo from "../../images/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { userAuth } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // Track if this is the first render after page load
  const isFirstRender = useRef(true);

  // Track if we've explicitly logged out
  const hasLoggedOut = useRef(false);

  // Store initial auth state from Redux
  const initialAuthState = useRef(userAuth?.data ? true : false);

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

  // Mark first render as complete after component mounts
  useEffect(() => {
    if (isFirstRender.current) {
      console.log(
        "First render, initial auth state:",
        initialAuthState.current ? "logged in" : "logged out"
      );
      isFirstRender.current = false;
    }

    // Check for auth in localStorage as a backup
    try {
      const storedAuth = localStorage.getItem("userAuth");
      if (storedAuth && !userAuth?.data) {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth?.data) {
          console.log("Restoring auth from localStorage");
          dispatch(login(parsedAuth));
        }
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
    }
  }, [dispatch, userAuth]);

  // Store auth in localStorage when it changes
  useEffect(() => {
    if (userAuth?.data) {
      try {
        localStorage.setItem("userAuth", JSON.stringify(userAuth));
      } catch (error) {
        console.error("Error storing auth in localStorage:", error);
      }
    }
  }, [userAuth]);

  const logoutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutApi,
    retry: false,
    onSuccess: () => {
      hasLoggedOut.current = true;
      dispatch(logout());
      setIsOpen(false);
      // Clear query cache on logout
      queryClient.clear();
      // Clear localStorage
      localStorage.removeItem("userAuth");
    },
  });

  // Disable the auth check if we already have auth and this is the first render
  const shouldSkipAuthCheck = isFirstRender.current && initialAuthState.current;

  const {
    data: authData,
    isLoading: isCheckingAuth,
    error: authError,
    isSuccess: isAuthSuccess,
    isError: isAuthError,
  } = useQuery({
    queryKey: ["checkauth"],
    queryFn: checkAuthApi,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Disable auto-refetch on window focus
    refetchOnMount: !shouldSkipAuthCheck, // Skip initial check if we already have auth
    refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes
    enabled: !shouldSkipAuthCheck, // Disable the query if we should skip it
    onError: (error) => {
      console.error("Auth check error:", error);
      // Only logout if we've explicitly logged out or if it's a 401 and not the first render
      if (
        hasLoggedOut.current ||
        (error?.response?.status === 401 && !isFirstRender.current)
      ) {
        dispatch(logout());
        localStorage.removeItem("userAuth");
      }
    },
    onSuccess: (data) => {
      if (data?.data) {
        dispatch(login(data));
        // Store in localStorage as backup
        try {
          localStorage.setItem("userAuth", JSON.stringify(data));
        } catch (error) {
          console.error("Error storing auth in localStorage:", error);
        }
      }
    },
  });

  // Handle auth state changes
  useEffect(() => {
    // Skip auth state updates on first render if we already have auth
    if (isFirstRender.current && initialAuthState.current) {
      return;
    }

    if (!isCheckingAuth) {
      if (isAuthSuccess && authData?.data) {
        dispatch(login(authData));
      } else if (
        isAuthError &&
        authError?.response?.status === 401 &&
        !isFirstRender.current
      ) {
        // Only logout on explicit 401 unauthorized and not on first render
        dispatch(logout());
        localStorage.removeItem("userAuth");
      }
    }
  }, [
    authData,
    isCheckingAuth,
    authError,
    isAuthSuccess,
    isAuthError,
    dispatch,
  ]);

  const handleLogout = () => {
    logoutMutation.mutate();
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

  // Always show UI if we have auth data, otherwise wait for check to complete
  const showAuthUI = userAuth?.data || !isCheckingAuth;
  const isAuthenticated = Boolean(userAuth?.data);

  return (
    <nav className="fixed top-0 z-40 flex h-16 w-full items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-4 shadow-lg backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full w-[12%] items-center"
      >
        <Link to="/" className="w-full h-full">
          {" "}
          <img
            src={logo || "/placeholder.svg"}
            alt="logo"
            className="max-h-full max-w-full object-contain filter drop-shadow-lg"
          />
        </Link>
      </motion.div>

      {showAuthUI && (
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
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg"
                  >
                    <Link to={'manage/profile'}> <User className="text-gray-900" size={20} />
                    </Link>
                   
                    <span className="sr-only">{name}</span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 rounded-full bg-gray-700/50 px-4 py-2 transition-all duration-300 hover:bg-gray-700"
                    onClick={handleLogout}
                    aria-label="Logout"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut
                      size={18}
                      className="text-white transition-colors group-hover:text-yellow-400"
                    />
                    <span className="text-sm font-medium text-white transition-colors group-hover:text-yellow-400">
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
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
