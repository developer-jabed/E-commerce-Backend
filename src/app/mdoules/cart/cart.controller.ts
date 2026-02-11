import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { IAddToCartPayload, IUpdateCartItemPayload, ICartFilterOptions } from "./cart.interface";
import { paginationHelper, IOptions } from "../../helper/paginationHelper";
import pick from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

export const CartController = {
  addToCart: catchAsync(async (req: Request, res: Response) => {
    const payload: IAddToCartPayload = req.body;
    const customerId = req.user.customerId;


    const cart = await CartService.addToCart(customerId, payload);

    sendResponse(res, { statusCode: 200, success: true, message: "Product added to cart", data: cart });
  }),

  updateItemQuantity: catchAsync(async (req: Request, res: Response) => {
    const payload: IUpdateCartItemPayload = req.body;
    const customerId = req.user.customerId;

    const cart = await CartService.updateItemQuantity(customerId, payload);

    sendResponse(res, { statusCode: 200, success: true, message: "Cart updated successfully", data: cart });
  }),

  removeItem: catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const customerId = req.user.customerId;

    const cart = await CartService.removeItem(customerId, productId);

    sendResponse(res, { statusCode: 200, success: true, message: "Product removed from cart", data: cart });
  }),

  clearCart: catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user.customerId;

    const cart = await CartService.clearCart(customerId);

    sendResponse(res, { statusCode: 200, success: true, message: "Cart cleared successfully", data: cart });
  }),

  getCart: catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user.customerId;

    const filterOptions: ICartFilterOptions = pick(req.query, ["searchTerm", "minPrice", "maxPrice"]);
    const options: IOptions = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const cart = await CartService.getCart(customerId, filterOptions, options);

    sendResponse(res, { statusCode: 200, success: true, message: "Cart retrieved successfully", meta: cart.meta, data: cart.data });
  }),
};
