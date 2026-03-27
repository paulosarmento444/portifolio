import type { NextApiHandler } from "next";
import { apiRouter } from "@faustwp/core";
import { serverEnv } from "@site/shared/server";
import "../../../../faust.config.js";

process.env.NEXT_PUBLIC_WORDPRESS_URL ??= serverEnv.wordpress.publicUrl;
process.env.FAUST_SECRET_KEY ??= serverEnv.faust.secretKey;

const handler: NextApiHandler = (req, res) => apiRouter(req, res);

export default handler;
