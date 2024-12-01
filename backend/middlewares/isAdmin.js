const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }
    // Check if user has admin or head role
    if (user.role !== "admin" && user.role !== "head") {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to access this resource",
      });
    }
    // If the user is an admin or head, allow them to proceed
    next();
  } catch (error) {
    console.error("Error checking user role:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default isAdmin;
