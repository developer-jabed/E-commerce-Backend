import express from "express";
import auth from "../../middlewares/auth";
import {
  createOrder,
  myOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} from "./order.controller";

const router = express.Router();

router.post("/", auth("CUSTOMER"), createOrder);
router.get("/my-orders", auth("CUSTOMER"), myOrders);
router.get("/:id", auth("CUSTOMER", "ADMIN"), getOrder);
router.patch("/:id/cancel", auth("CUSTOMER"), cancelOrder);
router.patch("/:id/status", auth("ADMIN"), updateOrderStatus);

export  const orderRoutes = router;
