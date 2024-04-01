import { io, Socket as SocketClient } from "socket.io-client";

// Get API host
require('dotenv').config(); 
const apiHost = process.env.API_PORT || "localhost"
const apiPort = process.env.API_PORT || "3333";

export default class Socket {
    private static instance: Socket;
    private socket: SocketClient;

    private constructor() {
        this.socket = io(`http://${apiHost}:${apiPort}`, {
            transports: ["websocket"],
        });
    }

    public static getInstance(): Socket {
        if (!Socket.instance) {
            console.log("Creating SocketTEWS instance");
            Socket.instance = new Socket();
        }
        return Socket.instance;
    }

    public getSocket(): SocketClient {
        return this.socket;
    }
}