const jwt = require("jsonwebtoken");

const generateRefreshToken = (user_id , role) => {
  return jwt.sign({ user_id:user_id , role:role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "2d" });
};

module.exports = { generateRefreshToken };