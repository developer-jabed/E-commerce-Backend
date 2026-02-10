import express, { NextFunction,  Request, Response } from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { fileUploader } from "../../helper/fileUploader";

const router = express.Router();

router.post(
    "/create-product",
    fileUploader.upload.array("images", 5),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const jsonData = req.body.data ? JSON.parse(req.body.data) : req.body;
            req.body = jsonData;
            return ProductController.createProduct(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);
router.get("/get-all-products", ProductController.getAllProducts);
router.get("/get-product/:id", ProductController.getProductById);
router.patch(
    "/update-product/:id",
    fileUploader.upload.array("images", 5),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const jsonData = req.body.data ? JSON.parse(req.body.data) : req.body;
            req.body = jsonData;
            return ProductController.updateProduct(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);
router.delete("/delete-product/:id", auth(Role.ADMIN), ProductController.deleteProduct);

export const ProductRoutes = router;
