import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function init() {
  if (!initialized) {
    await registerRoutes(app);
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err?.status || err?.statusCode || 500;
      const message = err?.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await init();
  return app(req, res);
}
