import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { createAdminSchema } from "./user.validation";

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






export const userRoutes = router;