import { Router } from "express";
import {
  requireAuth,
  requireMemberProfile,
  requireStaff,
} from "../../middleware/auth.js";
import {
  listResources,
  listAllResourcesForStaff,
  createResource,
  updateResource,
} from "./resources.controller.js";

export const resourcesRouter = Router();

resourcesRouter.get("/", listResources);
resourcesRouter.get(
  "/all",
  requireAuth,
  requireMemberProfile,
  requireStaff,
  listAllResourcesForStaff
);

resourcesRouter.post(
  "/",
  requireAuth,
  requireMemberProfile,
  requireStaff,
  createResource
);
resourcesRouter.patch(
  "/:id",
  requireAuth,
  requireMemberProfile,
  requireStaff,
  updateResource
);
