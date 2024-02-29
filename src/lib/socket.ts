import { io, Socket as SocketClient } from "socket.io-client";

export default class Socket {
    private static instance: Socket;
    private socket: SocketClient;

    private constructor() {
        this.socket = io("http://localhost:3333", {
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