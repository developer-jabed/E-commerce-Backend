
import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get("/", auth(Role.ADMIN), AdminController.getAllFromDB);

router.get("/:id", auth(Role.ADMIN), AdminController.getByIdFromDB);

router.delete("/:id", auth(Role.ADMIN), AdminController.deleteFromDB);

router.patch("/unblock/:id", auth(Role.ADMIN), AdminController.updateStatus);

router.delete("/soft/:id", auth(Role.ADMIN), AdminController.softDeleteFromDB);

export const AdminRoutes = router;
