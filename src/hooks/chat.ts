import { EffectCallback, useEffect } from "react";
import Sockette from "sockette";
import { Message, parse } from "tekko";

export function useChatClient(channelName: string, callback: (message: Message) => void) {
  const effect: EffectCallback = () => {
    const socket = new Sockette("wss://irc-ws.chat.twitch.tv", {
      onopen() {
        socket.send("CAP REQ :twitch.tv/tags");
        socket.send(`NICK justinfan${8000 + Math.round(Math.random() * 1000)}`);
        socket.send(`JOIN #${channelName.toLowerCase()}`);
      },
      onmessage(event) {
        const chunks = String(event.data).split("\r\n");

        chunks.forEach((chunk) => {
          if (chunk.length === 0) {
            return;
          }

          const message = parse(chunk);

          if (message.command === "PING") {
            socket.send(`PONG :${message.trailing}`);
          }

          callback(message);
        });
      },
    });

    return () => socket.close(1000);
  };

  useEffect(effect, [channelName]);
}
