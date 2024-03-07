const jwt = require("jsonwebtoken");

const generateAccessToken = (username) => {
  return jwt.sign({ username: username }, process.env.JWT_ACCESS_SECRET , { expiresIn: "1h" });
};

module.exports = { generateAccessToken };