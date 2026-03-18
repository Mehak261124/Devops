require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await app.prisma.$disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);