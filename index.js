const express = require('express');
require('dotenv').config();
const cors = require('cors');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy; // Import OAuth2Strategy

const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generateAccessToken } = require('./config/genJwtAccessToken');
const { generateRefreshToken } = require('./config/genJwtRefreshToken');
const getConnection = require('./config/dbConnect');

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const productCategoryRouter = require("./routes/productCategoryRoute");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

// app.use(passport.initialize()); // Initialize Passport


// passport.use(new OAuth2Strategy({
//   authorizationURL: 'https://www.example.com/oauth2/authorize',
//   tokenURL: 'https://www.example.com/oauth2/token',
//   clientID: '1011918781744-9b3n88e2rlo9188qqhrbonlgd3n7jnub.apps.googleusercontent.com',
//   clientSecret: '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',
//   callbackURL: 'http://localhost:3000/'
// },
// function(accessToken, refreshToken, profile, done) {
//   try {
//     const connection =  getConnection();
//     const [rows] =  connection.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);

//     if (rows.length > 0) {
//       // ผู้ใช้มีอยู่ในฐานข้อมูล
//       return done(null, rows[0]);
//     } else {
//       // สร้างผู้ใช้ใหม่และบันทึกลงในฐานข้อมูล
//       const newUser = {
//         google_id: profile.id,
//         name: profile.displayName,
//         email: profile.emails[0].value
//       };

//       connection.query('INSERT INTO users SET ?', newUser);

//       return done(null, newUser);
//     }
//   } catch (error) {
//     return done(error);
//   }
// }
// ));


// app.get('/auth/example',
//   passport.authenticate('oauth2'));

// app.get('/auth/example/callback',
//   passport.authenticate('oauth2', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });


// // Authentication route
// app.get('/auth/provider', passport.authenticate('provider', { scope: ['email', 'profile'] }));

// // Authentication callback route
// app.get('/auth/provider/callback', 
//   passport.authenticate('provider', { failureRedirect: '/login' }), 
//   (req, res) => {
//     const user = req.user;
//     const access_token = generateAccessToken(user.email);
//     const refresh_token = generateRefreshToken(user.email);

//     // Redirect to success URL or send response with tokens
//     res.redirect(`http://app.example.com?access_token=${access_token}&refresh_token=${refresh_token}`);
//   }
// );

// Route for user authentication
app.use("/user", authRouter);
app.use("/product", productRouter);
app.use("/category", productCategoryRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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
