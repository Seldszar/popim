import type { Settings } from "./types/settings";

export function encodeSettings(input: Settings): string {
  return Buffer.from(
    JSON.stringify([
      1,
      input.channel,
      input.command,
      input.duration,
      input.direction,
      input.authorizedBadges,
      input.authorizedUsers,
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
    authorizedBadges: data[5],
    authorizedUsers: data[6],
    minSize: data[7],
    maxSize: data[8],
  };
}
