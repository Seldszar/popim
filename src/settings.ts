import type { Settings } from "./types/settings";

import { map } from "lodash";

export function encodeSettings(input: Settings): string {
  return Buffer.from(
    JSON.stringify([
      1,
      input.channel,
      input.command,
      input.duration,
      input.direction,
      map(input.authorizedBadges, "name"),
      map(input.authorizedUsers, "name"),
      input.minSize,
      input.maxSize,
    ])
  ).toString("base64");
}

export function decodeSettings(input: string): Settings {
  const data = JSON.parse(Buffer.from(input, "base64").toString("utf8"));

  return {
    channel: data[1],
    command: data[2],
    duration: data[3],
    direction: data[4],
    authorizedBadges: map(data[5], (name) => ({ name })),
    authorizedUsers: map(data[6], (name) => ({ name })),
    minSize: data[7],
    maxSize: data[8],
  };
}
