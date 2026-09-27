import { Request, Response, Router } from "express";
import { authenticateSession } from "../middleware/auth";
import { getUserById, getUsers } from "../services/userService";

const router = Router();

router.get("/", authenticateSession, (req: Request, res: Response) => {
  getUsers(req, res);
});

router.get("/me", authenticateSession, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

router.get("/:id", authenticateSession, (req: Request, res: Response) => {
  getUserById(req, res);
});

export default router;
