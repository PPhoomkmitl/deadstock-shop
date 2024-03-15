const jwt = require("jsonwebtoken");

const generateAccessToken = (email , role) => {
  return jwt.sign({ email:email , role:role}, process.env.JWT_ACCESS_SECRET , { expiresIn: "1h" });
};

module.exports = { generateAccessToken };