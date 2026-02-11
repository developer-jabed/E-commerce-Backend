
import ApiError from "../../errors/api.error";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { OrderStatus } from "@prisma/client";

const createOrder = async (userId: string, payload: any) => {
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    for (const item of payload.items) {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: item.productId },
      });

      if (product.stock < item.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient stock");
      }

      totalAmount += product.price * item.quantity;

      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });
    }

    const order = await tx.order.create({
      data: {
        customerId: userId,
        totalAmount,
        items: {
          create: payload.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return order;
  });
};

/* ---------------------------------- */
const getMyOrders = async (
  userId: string,
  options: IOptions,
  filters: any
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const where: any = {
    customerId: userId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.searchTerm) {
    where.OR = [
      { id: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }

  const data = await prisma.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: { items: true },
  });

  const total = await prisma.order.count({ where });

  return {
    meta: { page, limit, total },
    data,
  };
};

/* ---------------------------------- */
const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  if (role !== "ADMIN" && order.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  return order;
};

/* ---------------------------------- */
const cancelOrder = async (orderId: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    if (order.customerId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Already canceled");
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    return await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });
  });
};

/* ---------------------------------- */
const updateOrderStatus = async (orderId: string, status: string) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};
