const express = require('express');
require('dotenv').config();

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
  credentials: true 
};

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");


const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const session = require('express-session');
const passport = require('passport');
require('./strategies/passport');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Route for user authentication
app.use("/user", authRouter);
app.use("/product", productRouter);
app.use("/category", productCategoryRouter);


// Start the server
const server = app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose another port.`);
  } else {
    console.error(`Unable to start the server: ${error.message}`);
  }
});



