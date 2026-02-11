import express from "express";
import auth from "../../middlewares/auth";
import {
  createReview,
  replyReview,
  getProductReviews,
  updateReviewController,
  deleteReviewController,
} from "./review.controller";

const router = express.Router();

router.post("/", auth("CUSTOMER"), createReview);
router.post("/:id/reply", auth("CUSTOMER"), replyReview);
router.patch("/:id", auth("CUSTOMER"), updateReviewController);
router.get("/product/:productId", getProductReviews);
router.delete("/:id", auth("CUSTOMER"), deleteReviewController);

export const reviewRoutes = router;
