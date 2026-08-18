import { createServer as createHttpServer } from "http";
import { createServer as createExpressApp } from "./server";
import { connectDB } from "./utils/db";
import * as dotenv from "dotenv";

dotenv.config({
  override: true,
});
const port = process.env.PORT || 4000;

const app = createExpressApp();
const httpServer = createHttpServer(app);

connectDB().then(() => {
  httpServer.listen(port, () => {
    console.log(`[server]: Backend API running on port ${port}`);
  });
});
