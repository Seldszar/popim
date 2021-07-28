import type { FC } from "react";

import { css } from "@emotion/react";
import { gsap } from "gsap";
import { escapeRegExp, includes, random, some } from "lodash";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { parse } from "tekko";
import tw, { styled } from "twin.macro";

import { ResolvedMedia } from "@/types/media";
import { Settings } from "@/types/settings";

import Media from "@/components/Media";

interface WrapperProps {
  direction: string;
}

const Wrapper = styled.div<WrapperProps>`
  ${tw`flex h-screen overflow-hidden relative`}

  ${(props) => {
    switch (props.direction) {
      case "bottom":
        return tw`items-end justify-center`;

      case "left":
        return tw`items-center justify-start`;

      case "right":
        return tw`items-center justify-end`;

      case "top":
        return tw`items-start justify-center`;
    }
  }}
`;

const Picture = styled.div`
  ${tw`p-8`}
`;

interface PictureMediaProps {
  maxSize: number;
  minSize: number;
}

const PictureMedia = styled.div<PictureMediaProps>`
  ${tw`bg-white p-2 rounded shadow-lg`}

  img,
  video {
    ${tw`block`}

    ${(props) => css`
      min-height: ${props.minSize}px;
      min-width: ${props.minSize}px;
      max-height: ${props.maxSize}px;
      max-width: ${props.maxSize}px;
    `}
  }
`;

const Curator = styled.div`
  ${tw`pt-1 text-gray-800 text-right text-xs leading-none uppercase`}
`;

interface WidgetProps {
  settings: Settings;
}

interface ActiveMedia {
  media: ResolvedMedia;
  curator?: string;
}

const mainTimeline = gsap.timeline();

const Widget: FC<WidgetProps> = ({ settings }) => {
  const commandPattern = useMemo(
    () =>
      new RegExp(
        `${escapeRegExp(settings.command)}\\s+((https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*)`,
        "i"
      ),
    [settings.command]
  );
  const propertyKey = useMemo(
    () => (includes(["top", "bottom"], settings.direction) ? "yPercent" : "xPercent"),
    [settings.direction]
  );
  const propertyValue = useMemo(
    () => (includes(["left", "top"], settings.direction) ? -100 : 100),
    [settings.direction]
  );

  const [activeMedia, setActiveMedia] = useState<ActiveMedia>();

  const pictureRef = useRef<HTMLDivElement>(null);

  const addMedia = async (url: string, curator?: string) => {
    if (!pictureRef.current) {
      return;
    }

    const response = await fetch(`/api/media?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      return;
    }

    const media = (await response.json()) as ResolvedMedia;

    const startAngle = random(-15, 15);
    const endAngle = startAngle + random(-15, 15);

    const tl = gsap.timeline();

    tl.call(() => {
      setActiveMedia({ media, curator });
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
  };

  const { sendMessage } = useWebSocket("wss://irc-ws.chat.twitch.tv", {
    retryOnError: true,
    onOpen() {
      sendMessage("CAP REQ :twitch.tv/tags");
      sendMessage(`NICK justinfan${random(8000, 9000)}`);
      sendMessage(`JOIN #${settings.channel.toLowerCase()}`);
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

            const isAuthorizedUser = some(settings.authorizedUsers, { name });
            const isAuthorizedBadge = some(settings.authorizedBadges, (badge) =>
              badges.includes(badge.name)
            );

            if (isAuthorizedBadge || isAuthorizedUser) {
              const matches = trailing.match(commandPattern);

              if (matches) {
                addMedia(matches[1], name);
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
  }, [propertyKey, propertyValue]);

  return (
    <Wrapper direction={settings.direction}>
      <Picture ref={pictureRef}>
        {activeMedia && (
          <PictureMedia maxSize={settings.maxSize} minSize={settings.minSize}>
            <Media {...activeMedia.media} />
            {activeMedia.curator && (
              <Curator>
                by <strong>{activeMedia.curator}</strong>
              </Curator>
            )}
          </PictureMedia>
        )}
      </Picture>
    </Wrapper>
  );
};

Widget.propTypes = {
  settings: PropTypes.any,
};

export default Widget;
