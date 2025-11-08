import type { Express, Request, Response, NextFunction } from "express";
import { Router } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, type User } from "@shared/schema";
import { storage } from "./storage";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

const asyncHandler = (handler: AsyncRouteHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

function toPublicUser(user: User) {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();

  apiRouter.get(
    "/users",
    asyncHandler(async (_req, res) => {
      const users = await storage.listUsers();
      res.json(users.map(toPublicUser));
    }),
  );

  apiRouter.get(
    "/users/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ message: "Invalid user id" });
        return;
      }

      const user = await storage.getUser(id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(toPublicUser(user));
    }),
  );

  apiRouter.post(
    "/users",
    asyncHandler(async (req, res) => {
      const parsed = insertUserSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid user data",
          errors: parsed.error.flatten(),
        });
        return;
      }

      const existing = await storage.getUserByUsername(parsed.data.username);

      if (existing) {
        res.status(409).json({ message: "Username already exists" });
        return;
      }

      const user = await storage.createUser(parsed.data);

      res.status(201).json(toPublicUser(user));
    }),
  );

  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
