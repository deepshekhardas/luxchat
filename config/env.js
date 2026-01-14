const dotenv = require('dotenv');

// Load env vars
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
  nodeEnv: process.env.NODE_ENV || 'development'
};
