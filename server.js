const { server } = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

// Connect to Database
connectDB().then(async () => {
    // Seed LuxBot
    try {
        const User = require('./models/User');
        const botEmail = 'luxbot@luxchat.com';
        const botExists = await User.findOne({ email: botEmail });

        if (!botExists) {
            console.log('Creating LuxBot User...');
            await User.create({
                name: 'LuxBot',
                email: botEmail,
                password: 'luxbotpassword123', // secure enough for internal use
                profile_pic: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', // Robot Icon
                status: 'online',
                last_seen: new Date()
            });
            console.log('LuxBot User Created! 🤖');
        } else {
            // Ensure bot is always online
            if (botExists.status !== 'online') {
                botExists.status = 'online';
                await botExists.save();
            }
        }
    } catch (err) {
        console.error('Error seeding LuxBot:', err);
    }
});

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
