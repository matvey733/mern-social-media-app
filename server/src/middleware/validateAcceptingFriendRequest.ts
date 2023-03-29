import { NextFunction } from "express";
import User, { IUser } from "../models/User";
import arrToString from "../utils/arrToString";
import { ConflictErr, ForbiddenErr, NotFoundErr } from "../utils/errs";
import { findDocsById } from "../utils/findDocs";
import idExistsInIdsArr from "../utils/idAlreadyExistsInArrayOfIds";
import { IReq, IRes } from "../utils/ReqResInterfaces";

export default async function validateAcceptingFriendRequest(req: IReq, res: IRes, next: NextFunction) {
  const { friendId: senderId } = req.params;
  const receiverId = req.data.user.userId;
  validateIds(senderId, receiverId);

  const [sender, receiver] = await findDocsById(User, [senderId, receiverId]);
  validateSenderAndReceiver(sender, receiver);

  req.data.sender = sender;
  req.data.receiver = receiver;

  next();
}

function validateIds(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw new ForbiddenErr("you cannot accept a friend request from yourself");
  }
}

function validateSenderAndReceiver(sender: IUser | null, receiver: IUser | null) {
  if (!sender) throw new NotFoundErr("sender not found");
  if (!receiver) throw new NotFoundErr("receiver not found");

  const receiverId = receiver._id.toString();
  const senderFriendReqsSent = arrToString(sender.friendRequestsSent);
  if (!senderFriendReqsSent.includes(receiverId)) {
    throw new ForbiddenErr("this user has not sent you a friend request");
  }

  const isFriendAlreadyAdded = idExistsInIdsArr(receiver.friends, sender._id);
  if (isFriendAlreadyAdded) {
    throw new ConflictErr("friend already added");
  }
}