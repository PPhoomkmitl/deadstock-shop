const jwt = require("jsonwebtoken");

const generateRefreshToken = (email , member) => {
  return jwt.sign({ email:email ,member:member }, process.env.JWT_REFRESH_SECRET, { expiresIn: "3d" });
};

module.exports = { generateRefreshToken };