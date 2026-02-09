
import { Admin, Prisma } from "@prisma/client";
import { IAdminFilterRequest } from "./admin.interface";
import ApiError from "../../errors/api.error";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";

   


const getAllFromDB = async (
  params: IAdminFilterRequest,
  options: IOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.AdminWhereInput[] = [];

  // 🔍 Search (User relation)
  if (searchTerm) {
    andCondions.push({
      OR: [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // 🎯 Filters (Admin fields)
  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AdminWhereInput =
    andCondions.length > 0 ? { AND: andCondions } : {};

  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      user: true, // 👈 important for frontend
    },
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: "desc" },
  });

  const total = await prisma.admin.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};


const deleteFromDB = async (id: string): Promise<Admin> => {
  const admin = await prisma.admin.delete({
    where: { id },
  });

  return admin;
};

const softDeleteFromDB = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  await prisma.user.update({
    where: { id: admin.userId },
    data: { isBlocked: true },
  });

  return admin;
};

export const AdminService = {
  getAllFromDB,
//   getByIdFromDB,
  deleteFromDB,
  softDeleteFromDB,
};
