import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { productSearchableFields } from "./product.constant";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.error";

const createIntoDB = async (payload: Prisma.ProductCreateInput) => {
  const result = await prisma.product.create({
    data: payload,
  });

  return result;
};

const getAllFromDB = async (query: any) => {
  const {
    searchTerm,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const andConditions: Prisma.ProductWhereInput[] = [];

  // 🔍 Search
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 💰 Price filter
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const skip = (Number(page) - 1) * Number(limit);

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return result;
};

const updateIntoDB = async (
  id: string,
  payload: Prisma.ProductUpdateInput
) => {
  const isExist = await prisma.product.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const result = await prisma.product.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteFromDB = async (id: string) => {
  const isExist = await prisma.product.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const result = await prisma.product.delete({
    where: { id },
  });

  return result;
};

export const ProductService = {
  createIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
