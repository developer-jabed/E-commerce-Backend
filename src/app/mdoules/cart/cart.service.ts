
import { IAddToCartPayload, IUpdateCartItemPayload, ICart, ICartFilterOptions } from "./cart.interface";
import { getCartCache, setCartCache, deleteCartCache } from "./cart.cache";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";

export const CartService = {
addToCart: async (
  customerId: string,
  payload: IAddToCartPayload
): Promise<ICart> => {

  // 1️⃣ Always get cart from DB for mutation safety
  let cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId },
      include: { items: true },
    });
  }

  // 2️⃣ Check if product exists in cart (FROM DB, not cache)
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: payload.productId,
    },
  });

  if (existingItem) {
    // 3️⃣ Safe atomic increment
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: {
          increment: payload.quantity,
        },
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
      },
    });
  }

  // 4️⃣ Get fresh updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // 5️⃣ Update cache safely
  if (updatedCart) {
    await setCartCache(customerId, updatedCart as ICart);
  }

  return updatedCart as ICart;
},


  updateItemQuantity: async (customerId: string, payload: IUpdateCartItemPayload): Promise<ICart> => {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(i => i.productId === payload.productId);
    if (!item) throw new Error("Product not in cart");

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: payload.quantity },
      include: { product: true },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (updatedCart) await setCartCache(customerId, updatedCart as ICart);

    return updatedCart as ICart;
  },

  removeItem: async (customerId: string, productId: string): Promise<ICart> => {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(i => i.productId === productId);
    if (!item) throw new Error("Product not in cart");

    await prisma.cartItem.delete({ where: { id: item.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (updatedCart) await setCartCache(customerId, updatedCart as ICart);

    return updatedCart as ICart;
  },

  clearCart: async (customerId: string): Promise<ICart> => {
    const cart = await prisma.cart.findUnique({ where: { customerId }, include: { items: true } });
    if (!cart) throw new Error("Cart not found");

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const clearedCart = await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    });

    if (clearedCart) await setCartCache(customerId, clearedCart as ICart);

    return clearedCart as ICart;
  },

  getCart: async (customerId: string, filterOptions?: ICartFilterOptions, options?: IOptions): Promise<{ meta: any; data: ICart['items'] }> => {
    const cart = (await getCartCache(customerId)) || (await prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true } } },
    }));

    if (!cart) throw new Error("Cart not found");

    let items = cart.items;

    // -----------------------------
    // Search/filter
    // -----------------------------
    if (filterOptions?.searchTerm) {
      items = items.filter(item =>
        item.product.name.toLowerCase().includes(filterOptions.searchTerm!.toLowerCase()) ||
        item.product.description?.toLowerCase().includes(filterOptions.searchTerm!.toLowerCase())
      );
    }

    if (filterOptions?.minPrice) items = items.filter(i => i.product.price >= filterOptions.minPrice!);
    if (filterOptions?.maxPrice) items = items.filter(i => i.product.price <= filterOptions.maxPrice!);

    // -----------------------------
    // Sort
    // -----------------------------
    if (options?.sortBy && options.sortOrder) {
      const sortBy = options.sortBy;
      items = items.sort((a, b) => {
        const aVal = (a.product as any)[sortBy];
        const bVal = (b.product as any)[sortBy];
        if (aVal < bVal) return options.sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return options.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // -----------------------------
    // Pagination
    // -----------------------------
    const { page, limit, skip } = paginationHelper.calculatePagination(options || {});
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      meta: { total: items.length, page, limit },
      data: paginatedItems,
    };
  },
};
