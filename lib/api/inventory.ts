import { client } from "./client";
import { ApiResponse } from "./models";

// Define the shape of a Product
export interface ProductEntity {
  id: number;
  en_name: string;
  th_name: string;
  unit_price: number;
  image_path?: string | null;
  created_at: string;
  updated_at: string;
}

// Define the response type from backend
export interface GetProductsResponse extends ApiResponse<ProductEntity[]> {}

/**
 * Inventory API namespace
 */
export namespace Inventory {
  /**
   * Fetch products by IDs
   * @param ids Optional comma-separated string of product IDs (e.g. "1,2,3")
   */
  export async function getProducts(ids?: string): Promise<GetProductsResponse> {
    const query = ids ? `?ids=${ids}` : "";
    const res = await client.get(`/inventory-service/products${query}`);
    return res.data as GetProductsResponse;
  }
}
