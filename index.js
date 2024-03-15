const express = require('express');
require('dotenv').config();
const cors = require('cors');

const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 


/* ยังมีปัญหาอยู่ */
// app.use(sanitizeMiddleware);
// app.use(notFound);
// app.use(errorHandler);



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
