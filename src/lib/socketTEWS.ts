import { io, Socket } from "socket.io-client";

export default class SocketTEWS {
    private static instance: SocketTEWS;
    private socket: Socket;

    private constructor() {
        this.socket = io("http://localhost:3333", {
            transports: ["websocket"],
        });
    }

    public static getInstance(): SocketTEWS {
        if (!SocketTEWS.instance) {
            console.log("Creating SocketTEWS instance");
            SocketTEWS.instance = new SocketTEWS();
        }
        return SocketTEWS.instance;
    }

    public getSocket(): Socket {
        return this.socket;
    }
}