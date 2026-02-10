export interface ICartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ICart {
  id: string;
  customerId: string;
  updatedAt: Date;
  items: ICartItem[];
}

export interface IAddToCartPayload {
  productId: string;
  quantity: number;
}

export interface IUpdateCartItemPayload {
  productId: string;
  quantity: number;
}

export interface ICartFilterOptions {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
}
