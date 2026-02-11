import ApiError from "../../errors/api.error";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import { OrderStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";


const createOrderFromCart = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { customerId: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    

    if (!cart || cart.items.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for ${product.name}`
        );
      }

      totalAmount += product.price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        customerId: userId,
        totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
};


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

  const data = await prisma.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  const total = await prisma.order.count({ where });

  return {
    meta: { page, limit, total },
    data,
  };
};

const getOrderById = async (
  orderId: string,
  userId: string,
  role: string
) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (role !== "ADMIN" && order.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  return order;
};


const cancelOrder = async (orderId: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (order.customerId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Only pending orders can be canceled"
      );
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }


    const updatedCustomer = await tx.customer.update({
      where: { id: order.customerId },
      data: {
        loyaltyPoint: {
          decrement: 50,
        },
        cancelCount: {
          increment: 1,
        },
      },
    });

 
    if (updatedCustomer.loyaltyPoint < 50) {
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      await tx.user.update({
        where: { id: order.customer.userId },
        data: {
          isBlocked: true,
          blockedUntil: oneMonthLater,
        },
      });
    }


    return await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });
  });
};


const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }


    if (
      order.status === OrderStatus.DELIVERED &&
      status === OrderStatus.DELIVERED
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Order already delivered"
      );
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status },
    });

    if (status === OrderStatus.DELIVERED) {
      const currentPoints = order.customer.loyaltyPoint;

      let reward = 0;

      if (currentPoints >= 100) {
        reward = 50;
      } else {
        reward = 20;
      }

      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          loyaltyPoint: {
            increment: reward,
          },
        },
      });
    }

    return updatedOrder;
  });
};

export const OrderService = {
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};
