import redis from "../../helper/redis";
import { ICart } from "./cart.interface";

const CART_PREFIX = "cart:";

export const getCartCache = async (customerId: string): Promise<ICart | null> => {
  const data = await redis.get(`${CART_PREFIX}${customerId}`);
  return data ? JSON.parse(data) : null;
};

export const setCartCache = async (customerId: string, cart: ICart) => {
  await redis.set(`${CART_PREFIX}${customerId}`, JSON.stringify(cart), "EX", 3600); // 1 hour
};

export const deleteCartCache = async (customerId: string) => {
  await redis.del(`${CART_PREFIX}${customerId}`);
};
