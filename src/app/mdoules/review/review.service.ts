import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.error";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";


const createReview = async (
  customerId: string,
  payload: any
) => {
  const { productId, rating, comment, photoUrls } = payload;


  const existing = await prisma.review.findFirst({
    where: {
      productId,
      customerId,
      parentId: null,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already reviewed this product"
    );
  }

  return prisma.review.create({
    data: {
      productId,
      customerId,
      rating,
      comment,
      photoUrls,
    },
  });
};


const replyToReview = async (
  customerId: string,
  reviewId: string,
  payload: any
) => {
  const parentReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!parentReview) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  return prisma.review.create({
    data: {
      productId: parentReview.productId,
      customerId,
      parentId: reviewId,
      comment: payload.comment,
    },
  });
};
const updateReview = async (
  customerId: string,
  reviewId: string,
  payload: { comment?: string; rating?: number; photoUrls?: string[] }
) => {

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }


  if (review.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot update this review");
  }


  return prisma.review.update({
    where: { id: reviewId },
    data: {
      comment: payload.comment ?? review.comment,
      rating: payload.rating ?? review.rating,
      photoUrls: payload.photoUrls ?? review.photoUrls,
    },
  });
};


const getProductReviews = async (
  productId: string,
  options: IOptions
) => {
  const { page, limit, skip } =
    paginationHelper.calculatePagination(options);

  const where = {
    productId,
    parentId: null,
  };

  const data = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        include: {
          user: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      replies: {
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const total = await prisma.review.count({ where });

  return {
    meta: { page, limit, total },
    data,
  };
};

const ReviewDelete = async (customerId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.customerId !== customerId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete this review");
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
};

export const ReviewService = {
  createReview,
  updateReview,
  replyToReview,
  getProductReviews,
  ReviewDelete,
};
