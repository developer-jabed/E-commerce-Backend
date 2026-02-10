import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { productSearchableFields } from "./product.constant";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.error";
import { fileUploader } from "../../helper/fileUploader";
import { IProduct } from "./product.interface";

const createProduct = async (req: any) => {
  const { name, description, price, stock } = req.body as IProduct;

  let imageUrls: string[] = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await fileUploader.uploadToCloudinary(file);
      if (uploadResult?.secure_url) imageUrls.push(uploadResult.secure_url);
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      images: imageUrls,
    },
  });

  return product;
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

const updateProduct = async (req: any) => {
  const productId = req.params.id;
  const { name, description, price, stock } = req.body as IProduct;

  // fetch existing product
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  let imageUrls = existingProduct.images;

  // add new images if uploaded
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await fileUploader.uploadToCloudinary(file);
      if (uploadResult?.secure_url) imageUrls.push(uploadResult.secure_url);
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      name: name ?? existingProduct.name,
      description: description ?? existingProduct.description,
      price: price ?? existingProduct.price,
      stock: stock ?? existingProduct.stock,
      images: imageUrls,
    },
  });

  return updatedProduct;
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
  createProduct,
  getAllFromDB,
  getByIdFromDB,
  updateProduct,
  deleteFromDB,
};
