import mongoose from "mongoose";
import signJwt from "../../utils/signJwt";
import mockUser from "../data/mockUser";


export default function getAuthHeader(id?: string | mongoose.Types.ObjectId) {
  const userId = id ?? mockUser._id;
  const token = signJwt({ userId });
  return `Bearer ${token}`;
}
