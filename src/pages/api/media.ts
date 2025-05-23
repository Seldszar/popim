import { Parser } from "htmlparser2";
import { head, inRange, split, trim } from "lodash";
import { NextApiHandler } from "next";

import { randomUserAgent } from "~/helpers/browser";
import { ResolvedMedia } from "~/types/media";

const METADATA_PROPERTIES = [
  "og:video:secure_url",
  "og:video:url",
  "og:video",

  "twitter:video:secure_url",
  "twitter:video:url",
  "twitter:video",

  "og:image:secure_url",
  "og:image:url",
  "og:image",

  "twitter:image:secure_url",
  "twitter:image:url",
  "twitter:image",
];

function getContentType(headers: Headers): string {
  return trim(head(split(headers.get("Content-Type"), ";")));
}

async function resolveMedia(url: string, shouldFollow = true): Promise<ResolvedMedia> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": randomUserAgent(),
    },
  });

  if (response.ok) {
    switch (getContentType(response.headers)) {
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
            if (name !== "meta") {
              return;
            }

            const index = METADATA_PROPERTIES.indexOf(attributes.property);

            if (inRange(index, matchIndex)) {
              matchUrl = attributes.content;
              matchIndex = index;
            }
          },
        });

        if (shouldFollow) {
          parser.write(await response.text());
          parser.end();

          if (matchUrl) {
            return resolveMedia(matchUrl, false);
          }
        }
      }
    }
  }

  throw new Error("Unable to resolve media");
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

  const {
    query: { url },
  } = request;

  if (typeof url === "string") {
    try {
      return response.json(await resolveMedia(url));
    } catch {} // eslint-disable-line no-empty

    response.status(404);
    response.end();

    return;
  }

  response.status(400);
  response.end();
};

export default handler;
