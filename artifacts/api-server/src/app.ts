import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Job applications carry a base64 CV (up to 5 MB); every other route keeps the small default limit.
const jsonDefault = express.json();
const jsonApplication = express.json({ limit: "8mb" });
app.use((req, res, next) => (/^\/api\/jobs\/\d+\/applications$/.test(req.path) ? jsonApplication : jsonDefault)(req, res, next));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
