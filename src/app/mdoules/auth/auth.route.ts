import express from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';


const router = express.Router();


router.get(
    "/me",
    auth(),
    AuthController.getMe
);


router.post(
    "/login",
    AuthController.loginUser
);

router.post("/logout", auth("CUSTOMER", "ADMIN"), AuthController.logout);


router.post(
    '/refresh-token',
    AuthController.refreshToken
);


router.post(
    '/change-password',
    auth(),
    AuthController.changePassword
);

export const authRoutes = router;
