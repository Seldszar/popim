import { NextApiHandler } from "next";

const handler: NextApiHandler = async (request, response) => {
  response.setHeader("Cache-Control", "public, max-age=300");

  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Max-Age", "300");

    response.status(204);
    response.end();

    return;
  }

  response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA,
    environment: process.env.NODE_ENV,
  });
};

export default handler;
