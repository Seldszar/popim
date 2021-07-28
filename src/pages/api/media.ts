import type { NextApiHandler } from "next";

import got from "got";
import { JSDOM } from "jsdom";
import { head, split, trim } from "lodash";

import { ResolvedMedia } from "@/types/media";

const followSelectors = [
  "meta[property='og:video']",
  "meta[property='twitter:video']",
  "meta[property='og:image']",
  "meta[property='twitter:image']",
];

async function resolveMedia(url: string, depth = 0): Promise<ResolvedMedia | undefined> {
  if (depth > 5) {
    return;
  }

  try {
    const {
      headers: { "content-type": contentType },
    } = await got.head(url);

    switch (trim(head(split(contentType, ";")))) {
      case "image/apng":
      case "image/avif":
      case "image/gif":
      case "image/jpeg":
      case "image/png":
      case "image/svg+xml":
      case "image/webp": {
        return { type: "image", url };
      }

      case "video/mp4":
      case "video/ogg":
      case "video/webm": {
        return { type: "video", url };
      }

      case "text/html": {
        const {
          window: {
            document: { head },
          },
        } = await JSDOM.fromURL(url);

        for (const selector of followSelectors) {
          const node = head.querySelector(selector);

          if (node) {
            const url = node.getAttribute("content");

            if (url) {
              return resolveMedia(url, depth + 1);
            }
          }
        }
      }
    }
  } catch {} // eslint-disable-line no-empty
}

const handler: NextApiHandler = async (request, response) => {
  response.setHeader("Cache-Control", `s-max-age=86400, stale-while-revalidate`);

  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Max-Age", "86400");

    response.status(204);
    response.end();

    return;
  }

  const media = await resolveMedia(request.query.url as string);

  if (media == null) {
    response.status(404);
    response.end();

    return;
  }

  response.json(media);
};

export default handler;
