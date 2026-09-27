import { Router, Request, Response } from "express";
import { authenticateSession } from "../middleware/auth";
import { getProducts, getProductById } from "../services/productService";

const router = Router();

router.get("/", authenticateSession, (req: Request, res: Response) => {
  getProducts(req, res);
});

router.get("/:id", authenticateSession, (req: Request, res: Response) => {
  getProductById(req, res);
});

export default router;
