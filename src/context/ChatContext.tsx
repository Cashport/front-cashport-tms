"use client";
import { getIdToken } from "@/utils/api/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo
} from "react";
import { io, Socket } from "socket.io-client";
import * as globalConfig from "@/config";

// Types
interface SocketConfig {
  customerId: string;
  ticketId?: string;
}

interface Message {
  id: string;
  from: string;
  content: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  timestamp: Date;
  status?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  stats: {
    activeTickets: number;
    totalMessages: number;
  };
  connect: (config: SocketConfig) => Promise<void>;
  disconnect: () => void;
  connectTicketRoom: (ticketId: string) => Promise<void>;
  // Nuevas funciones para actualizar estados
  subscribeToMessages: (callback: (message: Message) => void) => () => void;
  subscribeToTickets: (callback: (ticket: any) => void) => () => void;
}

// Socket Context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Custom Hook optimizado
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Hook especializado para mensajes con callback personalizado
export const useSocketMessages = (onNewMessage?: (message: Message) => void) => {
  const { messages, subscribeToMessages } = useSocket();

  useEffect(() => {
    if (!onNewMessage) return;

    return subscribeToMessages(onNewMessage);
  }, [onNewMessage, subscribeToMessages]);

  return messages;
};

// Socket Manager optimizado
class SocketManager {
  private socket: Socket | null = null;
  private messageCallbacks = new Set<(message: Message) => void>();
  private ticketCallbacks = new Set<(ticket: any) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(config: SocketConfig): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = (await getIdToken(false)) as string;
    if (!token) {
      throw new Error("Authentication token required");
    }

    this.socket = io(globalConfig.default.API_CHAT, {
      timeout: 20000,
      forceNew: false, // Reusar conexión si es posible
      reconnection: true,
      reconnectionDelay: Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000), // Backoff exponencial
      reconnectionAttempts: this.maxReconnectAttempts,
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` }
    });

    this.setupEventListeners(config);
    return this.socket;
  }

  private setupEventListeners(config: SocketConfig) {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on("connect", () => {
      console.info("Connected to chat socket server");
      this.reconnectAttempts = 0; // Reset counter on successful connection
      this.socket?.emit("join-user-room", config.customerId);
    });

    // Eventos de mensajes - usar callbacks optimizados
    this.socket.on("newMessage", (data: Message) => {
      this.messageCallbacks.forEach((callback) => callback(data));
    });

    this.socket.on("new-ticket", (data: any) => {
      this.ticketCallbacks.forEach((callback) => callback(data));
    });

    // Manejar errores de reconexión
    this.socket.on("reconnect_failed", () => {
      this.reconnectAttempts = this.maxReconnectAttempts;
    });
  }

  subscribeToMessages(callback: (message: Message) => void): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  subscribeToTickets(callback: (ticket: any) => void): () => void {
    this.ticketCallbacks.add(callback);
    return () => this.ticketCallbacks.delete(callback);
  }

  async joinTicketRoom(ticketId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Timeout joining ticket room"));
      }, 5000);

      this.socket.once("joined-ticket-room", () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once("join-ticket-room-error", (error: any) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      });

      this.socket.emit("join-ticket-room", ticketId);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // Limpiar callbacks
    this.messageCallbacks.clear();
    this.ticketCallbacks.clear();
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Socket Provider optimizado
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados optimizados con lazy initialization
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => []);
  const [stats, setStats] = useState(() => ({ activeTickets: 0, totalMessages: 0 }));

  // Socket manager singleton
  const socketManager = useRef<SocketManager | null>(null);

  // Initialize socket manager only once
  if (!socketManager.current) {
    socketManager.current = new SocketManager();
  }

  // Optimized message handler
  const handleNewMessage = useCallback((data: Message) => {
    setMessages((prev) => {
      // Evitar duplicados
      if (prev.some((msg) => msg.id === data.id)) return prev;
      return [...prev, data];
    });
    setStats((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
  }, []);

  // Optimized ticket handler
  const handleNewTicket = useCallback((data: any) => {
    setStats((prev) => ({ ...prev, activeTickets: prev.activeTickets + 1 }));
  }, []);

  const connect = useCallback(
    async (config: SocketConfig) => {
      try {
        const socket = await socketManager.current!.connect(config);

        // Subscribe to events only once
        socketManager.current!.subscribeToMessages(handleNewMessage);
        socketManager.current!.subscribeToTickets(handleNewTicket);

        // Monitor connection status
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));
      } catch (error) {
        console.error("Failed to connect:", error);
        throw error;
      }
    },
    [handleNewMessage, handleNewTicket]
  );

  // Optimized ticket room connection
  const connectTicketRoom = useCallback(async (ticketId: string) => {
    if (!socketManager.current) {
      throw new Error("Socket manager not initialized");
    }
    return socketManager.current.joinTicketRoom(ticketId);
  }, []);

  const disconnect = useCallback(() => {
    socketManager.current?.disconnect();
    setIsConnected(false);
  }, []);

  // Subscription functions for external components
  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    return socketManager.current?.subscribeToMessages(callback) ?? (() => {});
  }, []);

  const subscribeToTickets = useCallback((callback: (ticket: any) => void) => {
    return socketManager.current?.subscribeToTickets(callback) ?? (() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketManager.current?.disconnect();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    (): SocketContextType => ({
      socket: socketManager.current?.getSocket() ?? null,
      isConnected,
      messages,
      stats,
      connect,
      disconnect,
      connectTicketRoom,
      subscribeToMessages,
      subscribeToTickets
    }),
    [
      isConnected,
      messages,
      stats,
      connect,
      disconnect,
      connectTicketRoom,
      subscribeToMessages,
      subscribeToTickets
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
