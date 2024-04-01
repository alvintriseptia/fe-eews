import { io, Socket as SocketClient } from "socket.io-client";

// Get API host
const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost" as string;
const apiPort = process.env.NEXT_PUBLIC_API_PORT || "3333" as string;

export default class Socket {
    private static instance: Socket;
    private socket: SocketClient;

    private constructor() {
        this.socket = io(`${apiHost}:${apiPort}`, {
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