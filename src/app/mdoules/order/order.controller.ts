import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../helper/pick";
import { OrderService } from "./order.service";

export const createOrder = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await OrderService.createOrder(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

export const myOrders = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, ["status", "searchTerm"]);

  const result = await OrderService.getMyOrders(req.user.id, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched",
    meta: result.meta,
    data: result.data,
  });
});

export const getOrder = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await OrderService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched",
    data: result,
  });
});

export const cancelOrder = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await OrderService.cancelOrder(req.params.id, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order canceled & stock rolled back",
    data: result,
  });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated",
    data: result,
  });
});
