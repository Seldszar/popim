import { styled } from "goober";
import { gsap } from "gsap";
import { escapeRegExp, includes, random, some } from "lodash";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { useChatClient } from "~/hooks/chat";

import { ResolvedMedia } from "~/types/media";
import { Settings } from "~/types/settings";

import Media from "~/components/Media";

interface WrapperProps {
  direction: string;
}

const Wrapper = styled("div")<WrapperProps>`
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;

  ${(props) => {
    switch (props.direction) {
      case "bottom":
        return `
          align-items: flex-end;
          justify-content: center;
        `;

      case "left":
        return `
          align-items: center;
          justify-content: flex-start;
        `;

      case "right":
        return `
          align-items: center;
          justify-content: flex-end;
        `;

      case "top":
        return `
          align-items: flex-start;
          justify-content: center;
        `;
    }
  }}
`;

const Picture = styled("div", forwardRef)`
  padding: 32px;
`;

interface PictureMediaProps {
  maxSize: number;
  minSize: number;
}

const PictureMedia = styled("div")<PictureMediaProps>`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 8px;

  img,
  video {
    display: block;

    ${(props) => `
      max-height: ${props.maxSize}px;
      max-width: ${props.maxSize}px;
      min-height: ${props.minSize}px;
      min-width: ${props.minSize}px;
    `}
  }
`;

interface WidgetProps {
  settings: Settings;
}

interface ActiveMedia {
  media: ResolvedMedia;
  curator?: string;
}

const mainTimeline = gsap.timeline();

function Widget(props: WidgetProps) {
  const { settings } = props;

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

  useChatClient(settings.channel, (message) => {
    const { command, prefix, tags, trailing } = message;

    switch (command) {
      case "PRIVMSG": {
        const badges = String(tags?.badges);
        const name = String(prefix?.name);

        const isAuthorizedUser = some(settings.authorizedUsers, name);
        const isAuthorizedBadge = some(settings.authorizedBadges, (badge) =>
          badges.includes(badge)
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
          </PictureMedia>
        )}
      </Picture>
    </Wrapper>
  );
}

export default Widget;
