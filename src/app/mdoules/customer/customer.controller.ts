// src/app/modules/admin/admin.controller.ts

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";
import { customerFilterableFields } from "./customer.constant";
import { CustomerService } from "./customer.service";

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = pick(req.query, customerFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await CustomerService.getAllFromDB(filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customers retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomerService.getByIdFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer retrieved successfully",
      data: result,
    });
  }
);

const deleteFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomerService.deleteFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer deleted permanently",
      data: result,
    });
  }
);

const updateStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomerService.updateStatus(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer status updated",
      data: result,
    });
  }
);

const softDeleteFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CustomerService.softDeleteFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer soft deleted",
      data: result,
    });
  }
);

export const CustomerController = {
  getAllFromDB,
  getByIdFromDB,
  updateStatus,
  deleteFromDB,
  softDeleteFromDB,
};
