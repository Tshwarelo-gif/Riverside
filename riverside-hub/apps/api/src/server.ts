import "dotenv/config";
import express from "express";
import cors from "cors";
import { membersRouter } from "./modules/members/members.routes.js";
import { resourcesRouter } from "./modules/resources/resources.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { donationsRouter } from "./modules/donations/donations.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/members", membersRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/admin", adminRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Riverside API listening on port ${PORT}`);
});
