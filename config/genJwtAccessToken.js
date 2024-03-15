const jwt = require("jsonwebtoken");

const generateAccessToken = (email , member) => {
  return jwt.sign({ email:email , member:member}, process.env.JWT_ACCESS_SECRET , { expiresIn: "1h" });
};

module.exports = { generateAccessToken };