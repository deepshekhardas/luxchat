const { server } = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

// Connect to Database
connectDB();

// Start Server
const PORT = port || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
