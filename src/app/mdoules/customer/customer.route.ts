
import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { CustomerController } from "./customer.controller";


const router = express.Router();

router.get("/", auth(Role.ADMIN), CustomerController.getAllFromDB);

router.get("/:id", auth(), CustomerController.getByIdFromDB);

router.delete("/:id", auth(Role.ADMIN), CustomerController.deleteFromDB);

router.patch("/unblock/:id", auth(Role.ADMIN), CustomerController.updateStatus);

router.delete("/soft/:id", auth(Role.ADMIN), CustomerController.softDeleteFromDB);

export const CustomerRoutes = router;
