
import { Admin, Customer, Prisma } from "@prisma/client";
import ApiError from "../../errors/api.error";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { ICustomerFilterRequest } from "./customer.interface";
import { customerFilterableFields } from "./customer.constant";



const getAllFromDB = async (
  params: ICustomerFilterRequest,
  options: IOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...rawFilterData } = params;

  const andConditions: Prisma.CustomerWhereInput[] = [];

  // 🔍 SEARCH (name + email)
  if (searchTerm) {
    andConditions.push({
      OR: [
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  // 🎯 FILTERS
  Object.entries(rawFilterData).forEach(([key, value]) => {
    if (!value) return;

    // 🔹 USER FIELDS
    if (key === 'name') {
      andConditions.push({
        user: {
          name: {
            contains: value,
            mode: 'insensitive',
          },
        },
      });
      return;
    }

    if (key === 'email') {
      andConditions.push({
        user: {
          email: {
            contains: value,
            mode: 'insensitive',
          },
        },
      });
      return;
    }

    // 🔹 CUSTOMER FIELDS
    andConditions.push({
      [key]: {
        equals: value,
      },
    } as Prisma.CustomerWhereInput);
  });

  const whereConditions: Prisma.CustomerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.customer.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: { user: true },
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
  });

  const total = await prisma.customer.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};


const getByIdFromDB = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { user: true },
  });

   if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
  }

  
  return customer;
};


const deleteFromDB = async (id: string): Promise<Customer> => {
  return prisma.$transaction(async tx => {
    const customer = await tx.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    }

    await tx.customer.delete({
      where: { id },
    });

    await tx.user.delete({
      where: { id: customer.userId },
    });

    return customer;
  });
};


const updateStatus = async (id: string) => {
  return prisma.$transaction(async tx => {
    const customer = await tx.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    await tx.user.update({
      where: { id: customer.userId },
      data: { isBlocked: false },
    });

    return tx.customer.findUnique({
      where: { id },
      include: { user: true },
    });
  });
};

const softDeleteFromDB = async (id: string) => {
  return prisma.$transaction(async tx => {
    const customer = await tx.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    await tx.user.update({
      where: { id: customer.userId },
      data: { isBlocked: true },
    });

    return tx.customer.findUnique({
      where: { id },
      include: { user: true },
    });
  });
};


export const CustomerService = {
  getAllFromDB,
  getByIdFromDB,
  updateStatus,
  deleteFromDB,
  softDeleteFromDB,
};
