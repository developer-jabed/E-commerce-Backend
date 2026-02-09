import { Request, Response } from "express";
import { userService } from "./user.service";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";


const createAdmin = catchAsync(async (req: Request, res: Response) => {

    
    const result = await userService.createAdmin(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin created successfully!",
        data: result,
    });
});
const createCustomer = catchAsync(async (req: Request, res: Response) => {

    
    const result = await userService.createCustomer(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Customer created successfully!",
        data: result,
    });
});
const updateProfile = catchAsync(async (req: Request, res: Response) => {

    
    const result = await userService.updateProfile(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully!",
        data: result,
    });
});


export const userController = {
    createAdmin,
    createCustomer,
    updateProfile,
};