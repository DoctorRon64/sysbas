export type OscMessage = {
  address: string;
  args: unknown[];
};

export type OscMessageHandler = (message: OscMessage) => void;

export class OscBrowserClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<OscMessageHandler>();

  connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${window.location.host}/osc`;

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      this.socket = socket;

      socket.addEventListener("open", () => resolve(), { once: true });

      socket.addEventListener(
        "error",
        () => reject(new Error("Could not connect to OSC WebSocket")),
        { once: true }
      );

      socket.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data) as OscMessage;

          for (const handler of this.handlers) {
            handler(message);
          }
        } catch (error) {
          console.error("Invalid OSC bridge message:", error);
        }
      });
    });
  }

  onMessage(handler: OscMessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(address: string, ...args: unknown[]) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn("OSC socket is not connected.");
      return;
    }

    const message: OscMessage = { address, args };
    this.socket.send(JSON.stringify(message));
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}
