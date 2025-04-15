import { buildFastify } from "./utils/buildFastify";

const start = async () => {
    try {
        const server = await buildFastify(); // Await the server instance
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start();
