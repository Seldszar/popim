import clsx from "clsx";
import escapeStringRegexp from "escape-string-regexp";
import { gsap } from "gsap";
import { includes, lowerCase, random } from "lodash";
import { FC, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { parse } from "tekko";

import styles from "./App.module.scss";

const { settings } = window;

const COMMAND_PATTERN = new RegExp(
  `${escapeStringRegexp(settings.command)}\\s+((https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*)`,
  "i"
);

const propertyKey = includes(["top", "bottom"], settings.direction) ? "yPercent" : "xPercent";
const propertyValue = includes(["left", "top"], settings.direction) ? -100 : 100;

const mainTimeline = gsap.timeline();

const App: FC = () => {
  const pictureRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const addImage = async (src: string) => {
    const img = new Image();

    img.addEventListener("load", () => {
      const tl = gsap.timeline();

      const startAngle = random(-15, 15);
      const endAngle = startAngle + random(-15, 15);

      tl.set(imageRef.current, {
        attr: { src },
      });

      tl.set(pictureRef.current, {
        [propertyKey]: propertyValue,
        rotate: startAngle,
        opacity: 0,
      });

      tl.to(
        pictureRef.current,
        {
          [propertyKey]: 0,
          rotate: endAngle,
          opacity: 1,
        },
        "+=1"
      );

      tl.to(
        pictureRef.current,
        {
          [propertyKey]: propertyValue,
          opacity: 0,
        },
        `+=${settings.duration}`
      );

      mainTimeline.add(tl);
    });

    img.src = src;
  };

  const { sendMessage } = useWebSocket("wss://irc-ws.chat.twitch.tv", {
    retryOnError: true,
    onOpen() {
      sendMessage("CAP REQ :twitch.tv/tags");
      sendMessage(`NICK justinfan${random(8000, 9000)}`);
      sendMessage(`JOIN #${lowerCase(settings.channel)}`);
    },
    onMessage(event) {
      const chunks = event.data.split("\r\n");

      for (const chunk of chunks) {
        if (chunk.length === 0) {
          continue;
        }

        const { command, prefix, tags, trailing } = parse(chunk);

        switch (command) {
          case "PING": {
            sendMessage(`PONG :${trailing}`);

            break;
          }

          case "PRIVMSG": {
            const badges = String(tags?.badges);
            const name = String(prefix?.name);

            const isAuthorizedUser = settings.authorizedUsers.includes(name);
            const isAuthorizedBadge = settings.authorizedBadges.some((badge) =>
              badges.includes(badge)
            );

            if (isAuthorizedBadge || isAuthorizedUser) {
              const matches = trailing.match(COMMAND_PATTERN);

              if (matches) {
                addImage(matches[1]);
              }
            }

            break;
          }
        }
      }
    },
  });

  useEffect(() => {
    gsap.set(pictureRef.current, {
      [propertyKey]: propertyValue,
    });
  }, []);

  return (
    <div className={clsx(styles.wrapper, styles[settings.direction])}>
      <div ref={pictureRef} className={styles.picture}>
        <div className={styles.pictureImage}>
          <img
            ref={imageRef}
            className={styles.image}
            style={{
              maxHeight: `${settings.maxSize}px`,
              maxWidth: `${settings.maxSize}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
