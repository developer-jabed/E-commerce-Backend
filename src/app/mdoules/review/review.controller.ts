import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../helper/pick";
import { ReviewService } from "./review.service";

/* ================= CREATE REVIEW ================= */
export const createReview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ReviewService.createReview(
      req.user.customerId,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);


export const replyReview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ReviewService.replyToReview(
      req.user.customerId,
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Reply added successfully",
      data: result,
    });
  }
);

/* ================= GET REVIEWS ================= */
export const getProductReviews = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit"]);

    const result = await ReviewService.getProductReviews(
      req.params.productId,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
