
import { NextFunction, Request, Response } from "express";
import { AdminService } from "./admin.service";
import { adminFilterableFields } from "./admin.constant";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";


const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminService.getAllFromDB(filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admins retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getByIdFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getByIdFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  }
);

const deleteFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.deleteFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted permanently",
      data: result,
    });
  }
);

const updateStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.updateStatus(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin status updated",
      data: result,
    });
  }
);

const softDeleteFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.softDeleteFromDB(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin soft deleted",
      data: result,
    });
  }
);

export const AdminController = {
  getAllFromDB,
  getByIdFromDB,
  updateStatus,
  deleteFromDB,
  softDeleteFromDB,
};
