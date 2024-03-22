// s
// const OAuth2Strategy = require('passport-oauth2').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const getConnection = require('./dbConnect');
// var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


// passport.use('provider', new OAuth2Strategy(
//     {
//         // clientID: config.google.clientID,
//         // clientSecret: config.google.clientSecret,
//         // callbackURL: config.google.callbackURL
//         authorizationURL: 'https://www.provider.com/oauth2/authorize',
//         tokenURL: 'https://www.provider.com/oauth2/token',
//         clientID: '1011918781744-9b3n88e2rlo9188qqhrbonlgd3n7jnub.apps.googleusercontent.com',
//         clientSecret: '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',
//         callbackURL: 'http://localhost:3000/'
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const connection = await getConnection();
//       const [rows] = await connection.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
  
//       if (rows.length > 0) {
//         // ผู้ใช้มีอยู่ในฐานข้อมูล
//         return done(null, rows[0]);
//       } else {
//         // สร้างผู้ใช้ใหม่และบันทึกลงในฐานข้อมูล
//         const newUser = {
//           google_id: profile.id,
//           name: profile.displayName,
//           email: profile.emails[0].value
//         };
  
//         await connection.query('INSERT INTO users SET ?', newUser);
  
//         return done(null, newUser);
//       }
//     } catch (error) {
//       return done(error);
//     }
//   }));

// module.exports = { passport };