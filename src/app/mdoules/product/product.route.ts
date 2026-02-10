import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/", auth(Role.ADMIN), ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:id",  ProductController.getProductById);
router.patch("/:id", auth(Role.ADMIN), ProductController.updateProduct);
router.delete("/:id", auth(Role.ADMIN), ProductController.deleteProduct);

export const ProductRoutes = router;
