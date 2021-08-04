import type { NextApiHandler } from "next";

import got from "got";
import { Parser } from "htmlparser2";
import { IncomingHttpHeaders } from "http";
import { head, inRange, split, trim } from "lodash";

import { ResolvedMedia } from "@/types/media";

const METADATA_PROPERTIES = ["og:video", "twitter:video", "og:image", "twitter:image"];

function getContentType(headers: IncomingHttpHeaders): string {
  return trim(head(split(headers["content-type"], ";")));
}

async function resolveMedia(url: string, depth = 0): Promise<ResolvedMedia | undefined> {
  if (depth > 5) {
    return;
  }

  try {
    const { body, headers } = await got.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    switch (getContentType(headers)) {
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
        let matchUrl: string | undefined;
        let matchIndex = Infinity;

        const parser = new Parser({
          onopentag(name, attributes) {
            if (name === "meta") {
              const index = METADATA_PROPERTIES.indexOf(attributes.property);

              if (inRange(index, matchIndex)) {
                matchUrl = attributes.content;
                matchIndex = index;
              }
            }
          },
        });

        parser.write(body);
        parser.end();

        if (matchUrl) {
          return resolveMedia(matchUrl, depth + 1);
        }
      }
    }
  } catch {} // eslint-disable-line no-empty
}

const handler: NextApiHandler = async (request, response) => {
  response.setHeader("Cache-Control", "public, max-age=86400");

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
