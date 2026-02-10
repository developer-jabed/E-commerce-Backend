import { Request, Response } from "express";
import httpStatus from "http-status";
import { ProductService } from "./product.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getByIdFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
