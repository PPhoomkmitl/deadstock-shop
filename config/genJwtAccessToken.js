const jwt = require("jsonwebtoken");

const generateAccessToken = (user_id , role) => {
  return jwt.sign({ user_id:user_id , role:role}, process.env.JWT_ACCESS_SECRET , { expiresIn: "1h" });
};

module.exports = { generateAccessToken };