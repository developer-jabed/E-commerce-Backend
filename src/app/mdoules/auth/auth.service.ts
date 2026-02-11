
import * as bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.error";
import { jwtHelpers } from "../../helper/jwtHelper";


interface LoginPayload {
  email: string;
  password: string;
}


interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}


const loginUser = async (payload: LoginPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email },
    include: { customer: true },
  });

  if (user.isBlocked) {
    if (user.blockedUntil && new Date() > user.blockedUntil) {

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isBlocked: false,
          blockedUntil: null,
        },
      });
    } else {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `User is blocked until ${user.blockedUntil}`
      );
    }
  }



  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user.password!
  );

  if (!isPasswordValid) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Password incorrect"
    );
  }



  const payloadData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customer?.id || null,
  };

  const accessToken = jwtHelpers.generateToken(
    payloadData,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    payloadData,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return { accessToken, refreshToken };
};



const refreshToken = async (token: string) => {
  let decodedData: any;
  try {
    decodedData = jwtHelpers.verifyToken(token, config.jwt.refresh_token_secret as Secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { email: decodedData.email } });
  if (user.isBlocked !== false) {
    throw new ApiError(httpStatus.FORBIDDEN, "User is not active");
  }

  const accessToken = jwtHelpers.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return { accessToken, refreshToken };
};

const changePassword = async (user: any, payload: ChangePasswordPayload) => {
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
  const isPasswordValid = await bcrypt.compare(payload.oldPassword, dbUser.password!);
  if (!isPasswordValid) throw new ApiError(httpStatus.UNAUTHORIZED, "Old password incorrect");

  const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.salt_round));

  await prisma.user.update({
    where: { email: dbUser.email },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};




const getMe = async (user: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { id: user.id, isBlocked: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      customer: true,
      admin: true,
    },
  });

  return userData;
};


export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  getMe,
};