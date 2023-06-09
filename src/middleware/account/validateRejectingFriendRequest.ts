import { findDocsByIds } from "../../utils/findDocs";
import User from "../../models/User";
import { IReq, IRes } from "../../utils/reqResInterfaces";
import { NextFunction } from "express";
import { ForbiddenErr, NotFoundErr } from "../../utils/errs";
import userProjection from "../../utils/projections/userProjection";
import findFriendReqSenderAndReceiver from "../../utils/reqs/findFriendInFriendRequestsContext";
import validateObjectId from "../../utils/validateObjectId";


export default async function validateRejectingFriendRequest(req: IReq, res: IRes, next: NextFunction) {
  const { friendId: senderId } = req.params;
  const receiverId = req.data.user.userId;
  validateIds(senderId, receiverId);

  const [sender, receiver] = await findFriendReqSenderAndReceiver(senderId, receiverId);

  if (!sender) throw new NotFoundErr("sender not found");
  if (!receiver) throw new NotFoundErr("receiver not found");

  req.data.sender = sender;
  req.data.receiver = receiver;

  next();
}


function validateIds(senderId: string, receiverId: string) {
  validateObjectId(senderId);
  if (senderId === receiverId) {
    throw new ForbiddenErr("you cannot accept a friend request from yourself");
  }
}
