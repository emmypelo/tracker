import User from "../models/User.js";

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Fetch the complete user data from the database
    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.log("User details:", userDetails);

    // Check if user has admin role
    if (userDetails.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this operation",
      });
    }
    req.userDetails = userDetails;
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default isAdmin;
