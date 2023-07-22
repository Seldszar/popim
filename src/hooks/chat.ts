import { useEffect, useRef } from "react";
import Sockette from "sockette";
import { Message, parse } from "tekko";

export type Callback = (message: Message) => void;

export function useChatClient(channelName: string, callback: Callback) {
  const callbackRef = useRef<Callback>();

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    let pingInterval: NodeJS.Timeout | undefined;
    let pongTimeout: NodeJS.Timeout | undefined;

    const socket = new Sockette("wss://irc-ws.chat.twitch.tv", {
      onopen() {
        socket.send("CAP REQ :twitch.tv/tags");
        socket.send(`NICK justinfan${8000 + Math.round(Math.random() * 1000)}`);
        socket.send(`JOIN #${channelName.toLowerCase()}`);

        pingInterval = setInterval(() => {
          clearTimeout(pongTimeout);

          pongTimeout = setTimeout(() => {
            socket.reconnect();
          }, 30000);

          socket.send("PING");
        }, 240000);
      },
      onclose() {
        clearInterval(pingInterval);
        clearTimeout(pongTimeout);
      },
      onmessage(event) {
        const chunks = String(event.data).split("\r\n");

        chunks.forEach((chunk) => {
          if (chunk.length === 0) {
            return;
          }

          const message = parse(chunk);

          switch (message.command) {
            case "PING": {
              socket.send(`PONG :${message.trailing}`);

              break;
            }

            case "PONG": {
              clearTimeout(pongTimeout);

              break;
            }

            case "RECONNECT": {
              socket.reconnect();

              break;
            }
          }

          callbackRef.current?.(message);
        });
      },
    });

    return () => {
      socket.close(1000);
    };
  }, [channelName]);
}
