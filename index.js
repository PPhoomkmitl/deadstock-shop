const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
  credentials: true 
};

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");

const getConnection = require('./config/dbConnect');


const PORT = process.env.PORT || 5000;

const app = express();

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



// Parse webhook payload as raw body
app.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_SECRET_ENDPOINT_KEY;

  const connection = await getConnection();
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const paymentSuccessData = event.data.object;
      const sessionId = paymentSuccessData.id;

      console.log('payment in!');
      const data = {
        fullfill_status: paymentSuccessData.status,
      };

      console.log(data.status);

      try {
        const [result] = await connection.query("UPDATE orders SET ? WHERE session_id = ?", [
          data,
          sessionId,
        ]);
        console.log("=== update result", result);
       
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send(`Error updating order status: ${error.message}`);
        return;
      }

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));


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
