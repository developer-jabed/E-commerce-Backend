import express from "express";
import auth from "../../middlewares/auth";
import {
  createReview,
  replyReview,
  getProductReviews,
} from "./review.controller";

const router = express.Router();

router.post("/", auth("CUSTOMER"), createReview);
router.post("/:id/reply", auth("CUSTOMER"), replyReview);
router.get("/product/:productId", getProductReviews);

export const reviewRoutes = router;
