"use client";
import { getIdToken } from "@/utils/api/api";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  activities: Activity[];

  // eslint-disable-next-line no-unused-vars
  connect: (config: SocketConfig) => void;
  disconnect: () => void;
  // eslint-disable-next-line no-unused-vars
  connectTicketRoom: (ticketId: string) => void;
}

interface Activity {
  id: string;
  message: string;
  type: "new-message" | "new-ticket" | "customer-update" | "ticket-update";
  timestamp: Date;
}

// Socket Context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Custom Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Functional Socket Manager Factory
const createSocketConnection = async (): Promise<Socket> => {
  const token = (await getIdToken(false)) as string;

  if (!token) {
    throw new Error("Authentication token is required to connect to the socket server");
  }

  return io(globalConfig.default.API_CHAT, {
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: {
      token: token
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Event Handler Factory - Pure Functions
const createEventHandlers = (
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setStats: React.Dispatch<React.SetStateAction<{ activeTickets: number; totalMessages: number }>>,
  // eslint-disable-next-line no-unused-vars
  addActivity: (message: string, type: Activity["type"]) => void,
  // eslint-disable-next-line no-unused-vars
  showToast: (message: string, type: "success" | "error" | "info") => void,
  config: SocketConfig
) => {
  return {
    onConnect: (socket: Socket) => () => {
      console.log("Connected to server");
      setIsConnected(true);
      showToast("Conectado al servidor", "success");

      socket.emit("join-user-room", config.customerId);
    },

    onDisconnect: () => (reason: string) => {
      console.log("Disconnected from server:", reason);
      setIsConnected(false);
      showToast("Desconectado del servidor", "error");

      if (reason === "io server disconnect") {
        showToast("Desconectado por el servidor. Verifique su token de autenticación.", "error");
      }
    },

    onConnectError: () => (error: Error) => {
      console.error("Connection error:", error);
      setIsConnected(false);

      if (error.message?.includes("Authentication") || error.message?.includes("Unauthorized")) {
        showToast("Error de autenticación. Por favor, verifique su token.", "error");
      } else {
        showToast(`Error de conexión: ${error.message || "Error desconocido"}`, "error");
      }
    },

    onReconnect: () => (attemptNumber: number) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      showToast("Reconectado al servidor", "success");
      setIsConnected(true);
    },

    onReconnectFailed: () => () => {
      console.error("Failed to reconnect");
      showToast("No se pudo reconectar al servidor", "error");
      setIsConnected(false);
    },

    onNewMessage: () => (data: Message) => {
      console.log("New message received:", data);
      setMessages((prev) => [...prev, data]);
      setStats((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
      addActivity(`Nuevo mensaje de ${data.customer?.name || data.from}`, "new-message");
      showToast(`Nuevo mensaje de ${data.customer?.name || data.from}`, "success");
    },

    onMessageStatusUpdate: () => (data: any) => {
      console.log("Message status update:", data);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, status: data.status } : msg))
      );
    },

    onCustomerUpdate: () => (data: any) => {
      console.log("Customer update:", data);
      addActivity(`Cliente actualizado: ${data.name || data.phone}`, "customer-update");
    },

    onTicketUpdate: () => (data: any) => {
      console.log("Ticket update:", data);
      addActivity("Ticket actualizado", "ticket-update");
    },

    onNewTicket: () => (data: any) => {
      console.log("New ticket:", data);
      setStats((prev) => ({ ...prev, activeTickets: prev.activeTickets + 1 }));
      addActivity(
        `Nuevo ticket creado para ${data.customer?.name || data.customer?.phone}`,
        "new-ticket"
      );
      showToast(`Nuevo ticket para ${data.customer?.name || data.customer?.phone}`, "success");
    }
  };
};

// Attach event listeners - Pure function
const attachSocketListeners = (
  socket: Socket,
  handlers: ReturnType<typeof createEventHandlers>
) => {
  socket.on("connect", handlers.onConnect(socket));
  socket.on("disconnect", handlers.onDisconnect());
  socket.on("connect_error", handlers.onConnectError());
  socket.on("reconnect", handlers.onReconnect());
  socket.on("reconnect_failed", handlers.onReconnectFailed());
  socket.on("newMessage", handlers.onNewMessage());
  socket.on("messageStatusUpdate", handlers.onMessageStatusUpdate());
  socket.on("customerUpdate", handlers.onCustomerUpdate());
  socket.on("ticketUpdate", handlers.onTicketUpdate());
  socket.on("new-ticket", handlers.onNewTicket());

  // Return cleanup function
  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("reconnect");
    socket.off("reconnect_failed");
    socket.off("newMessage");
    socket.off("messageStatusUpdate");
    socket.off("customerUpdate");
    socket.off("ticketUpdate");
    socket.off("new-ticket");
  };
};

// Socket Provider Component - Fully Functional
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({ activeTickets: 0, totalMessages: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);

  // Store cleanup functions
  const cleanupRef = useRef<(() => void) | null>(null);
  const ticketCleanupRef = useRef<(() => void) | null>(null);

  // Utility functions
  const addActivity = useCallback((message: string, type: Activity["type"]) => {
    const activity: Activity = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: new Date()
    };
    setActivities((prev) => [activity, ...prev].slice(0, 50));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    // Integration point for your toast library
    console.log(`[${type.toUpperCase()}]: ${message}`);
  }, []);

  // Connect function
  const connect = useCallback(
    (config: SocketConfig) => {
      // Disconnect existing socket if any
      if (socket?.connected) {
        socket.disconnect();
      }

      // Clean up previous listeners
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Create new socket connection
      createSocketConnection()
        .then((newSocket) => {
          // Create and attach event handlers
          const handlers = createEventHandlers(
            setIsConnected,
            setMessages,
            setStats,
            addActivity,
            showToast,
            config
          );

          const cleanup = attachSocketListeners(newSocket, handlers);
          cleanupRef.current = cleanup;

          setSocket(newSocket);
        })
        .catch((error) => {
          console.error("Failed to create socket connection:", error);
          showToast("Error al conectar con el servidor de sockets", "error");
        });
    },
    [socket, addActivity, showToast]
  );

  // Connect to ticket room function
  const connectTicketRoom = useCallback(
    (ticketId: string) => {
      if (socket?.connected) {
        socket.emit("join-ticket-room", ticketId);
      }
    },
    [socket]
  );

  // Disconnect function
  const disconnect = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (ticketCleanupRef.current) {
      ticketCleanupRef.current();
      ticketCleanupRef.current = null;
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    setIsConnected(false);
  }, [socket]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: SocketContextType = {
    socket,
    isConnected,
    messages,
    stats,
    activities,
    connect,
    disconnect,
    connectTicketRoom
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
