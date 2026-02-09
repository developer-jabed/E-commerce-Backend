import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { createAdminSchema, createCustomerSchema, updateProfileSchema } from "./user.validation";

const router = express.Router();


router.post(
  "/create-admin",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.data) throw new Error("Missing 'data' field");

      const jsonData = JSON.parse(req.body.data);

      const validated = createAdminSchema.parse({ body: jsonData });
  
      req.body = validated.body;

      return userController.createAdmin(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/create-customer",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.data) throw new Error("Missing 'data' field");

      const jsonData = JSON.parse(req.body.data);

      const validated = createCustomerSchema.parse({ body: jsonData });
  
      req.body = validated.body;

      return userController.createCustomer(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/update-profile/:id",
  fileUploader.upload.single("file"), // optional avatar upload
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const jsonData = req.body.data ? JSON.parse(req.body.data) : req.body;

      const validated = updateProfileSchema.parse({ body: jsonData });

      req.body = validated.body;

      return userController.updateProfile(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);





export const userRoutes = router;