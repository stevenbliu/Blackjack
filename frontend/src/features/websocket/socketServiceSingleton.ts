// socketServiceSingleton.ts
import { SocketService } from './socketService';

// Create a single instance
const socketServiceInstance = new SocketService();

// Export the instance as default
export default socketServiceInstance;