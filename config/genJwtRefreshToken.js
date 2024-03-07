const jwt = require("jsonwebtoken");

const generateRefreshToken = (username) => {
  return jwt.sign({ username:username }, process.env.JWT_REFRESH_SECRET, { expiresIn: "3d" });
};

module.exports = { generateRefreshToken };