import { Request, Response } from "express";
import { proxyRequest } from "./proxyService";
import { mapProduct } from "../utils/responseMapper";
import { DownstreamProduct, ApiResponse, BffProduct } from "../types";

export async function getProducts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const response = await proxyRequest<ApiResponse<DownstreamProduct[]>>(
      { method: "GET", path: "/products" },
      req.accessToken
    );

    const result: ApiResponse<BffProduct[]> = {
      success: response.success,
      data: response.data.map(mapProduct),
      meta: response.meta,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export async function getProductById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const response = await proxyRequest<DownstreamProduct>(
      { method: "GET", path: `/products/${req.params.id}` },
      req.accessToken
    );

    res.json({ success: true, data: mapProduct(response) });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
