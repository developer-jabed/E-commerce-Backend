import express from 'express';
import { userRoutes } from '../mdoules/users/user.route';
import { authRoutes } from '../mdoules/auth/auth.route';
import { AdminRoutes } from '../mdoules/admin/admin.route';
import { CustomerRoutes } from '../mdoules/customer/customer.route';
import { ProductRoutes } from '../mdoules/product/product.route';
import { CartRoutes } from '../mdoules/cart/cart.route';

const router = express.Router();

const moduleRoutes = [

  {
    path: '/users',
    route: userRoutes

  },
  {
    path: '/auth',
    route: authRoutes
  },
  {
    path: '/admins',
    route: AdminRoutes
  },
  {
    path:  '/customers',
    route: CustomerRoutes
  },
  {
    path: '/products',
    route: ProductRoutes
  },
  {
    path: '/carts',
    route: CartRoutes
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;