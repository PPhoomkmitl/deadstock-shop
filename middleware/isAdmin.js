const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role === "super_admin" || req.user.role === "user_admin") {
      next();
    } else {
      throw new Error("You are not authorized to access this resource");
    }
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res
      .status(403)
      .json({
        error: "Forbidden",
        message: "You are not authorized to access this resource",
      });
  }
};

module.exports = isAdmin;
