import express from "express";

import auth from "../../middlewares/auth";
import { CartController } from "../cart/cart.controller";

const router = express.Router();


router.post("/add", auth(), CartController.addToCart);


router.patch("/update", auth(), CartController.updateItemQuantity);


router.delete("/remove/:productId", auth(), CartController.removeItem);

router.delete("/clear", auth(), CartController.clearCart);


router.get("/", auth(), CartController.getCart);

export const CartRoutes = router;
