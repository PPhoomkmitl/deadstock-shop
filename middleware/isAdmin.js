const isAdmin = async (req, res, next) => {
  try {
    const { email } = req.user;
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await connection.query(sql, [email]);

    if (
      rows.length > 0 &&
      (req.user.role === "super_admin" || req.user.role === "user_admin")
    ) {
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
