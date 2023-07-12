import { styled } from "goober";
import { escapeRegExp, some } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useQueue } from "react-use";

import { useChatClient } from "~/hooks";
import { decodeSettings } from "~/settings";
import { ResolvedMedia } from "~/types";

const Frame = dynamic(() => import("~/components/Frame"), {
  ssr: false,
});

interface WrapperProps {
  direction: string;
}

const Wrapper = styled("div")<WrapperProps>`
  display: flex;
  height: 100vh;
  overflow: hidden;
  padding: 32px;
  position: relative;
  user-select: none;

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

interface Item {
  media: ResolvedMedia;
  curator: string;
}

function Page() {
  const { query } = useRouter();

  const settings = useMemo(() => decodeSettings(query.settings as string), [query.settings]);
  const commandPattern = useMemo(
    () =>
      new RegExp(
        `${escapeRegExp(settings.command)}\\s+((https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*)`,
        "i"
      ),
    [settings.command]
  );

  const { first, add, remove } = useQueue<Item>();

  const addMedia = async (url: string, curator: string) => {
    const response = await fetch(`/api/media?url=${encodeURIComponent(url)}`);

    if (response.ok) {
      add({ curator, media: await response.json() });
    }
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

  return (
    <Wrapper direction={settings.direction}>
      {first && <Frame {...first} settings={settings} onComplete={() => remove()} />}
    </Wrapper>
  );
}

export default Page;
