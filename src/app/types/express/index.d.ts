import { IUserPayload } from "../../app/modules/auth/auth.interface"; // your user payload interface

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload; // or your user object type
    }
  }
}
