import { defaults } from "lodash";

import { Settings } from "./types/settings";

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  channel: "",
  command: "!popim",
  direction: "top",
  minSize: 0,
  maxSize: 520,
  duration: 8,
  authorizedBadges: ["broadcaster/1", "moderator/1", "vip/1"],
  authorizedUsers: [],
};

export function encodeSettings(input: Settings): string {
  const data = JSON.stringify([
    input.version,
    input.channel,
    input.command,
    input.duration,
    input.direction,
    input.authorizedBadges,
    input.authorizedUsers,
    input.minSize,
    input.maxSize,
  ]);

  return Buffer.from(data).toString("base64");
}

export function decodeSettings(input: string): Settings {
  let settings: Settings | undefined;

  try {
    const data = JSON.parse(Buffer.from(input, "base64").toString("utf8"));

    settings = {
      version: data[0],
      channel: data[1],
      command: data[2],
      duration: data[3],
      direction: data[4],
      authorizedBadges: data[5],
      authorizedUsers: data[6],
      minSize: data[7],
      maxSize: data[8],
    };
  } catch {} // eslint-disable-line no-empty

  return defaults(settings, DEFAULT_SETTINGS);
}
