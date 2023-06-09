import { NextFunction } from "express";
import User from "../../models/User";
import { ConflictErr, ForbiddenErr, NotFoundErr } from "../../utils/errs";
import idExistsInIdsArr from "../../utils/idAlreadyExistsInArrayOfIds";
import { IReq, IRes } from "../../utils/reqResInterfaces";
import { IUser } from "../../models/User";
import { findDocsByIds, findDocs } from "../../utils/findDocs";
import { HydratedDocument } from "mongoose";
import userProjection from "../../utils/projections/userProjection";
import findFriendReqSenderAndReceiver from "../../utils/reqs/findFriendInFriendRequestsContext";
import validateObjectId from "../../utils/validateObjectId";


export async function validateSendingFriendRequest(req: IReq, res: IRes, next: NextFunction) {
  const { friendId: receiverId } = req.params;
  const senderId: string = req.data.user.userId;
  validateIds(senderId, receiverId);

  const [sender, receiver] = await findFriendReqSenderAndReceiver(senderId, receiverId);
  validateSenderAndReceiver(sender, receiver);

  req.data.sender = sender;
  req.data.receiver = receiver;

  next();
}


function validateIds(senderId: string, receiverId: string) {
  validateObjectId(receiverId);
  if (senderId === receiverId) {
    throw new ForbiddenErr("you cannot send a friend request to yourself");
  }
}


function validateSenderAndReceiver(
  sender: IUser | null, receiver: IUser | null
) {
  if (!sender) throw new NotFoundErr("sender not found");
  if (!receiver) throw new NotFoundErr("receiver not found");

  const isReqAlreadySent = idExistsInIdsArr(
    sender.friendRequestsSent, receiver.id
  );
  const isReqAlreadySentByReceiver = idExistsInIdsArr(
    receiver.friendRequestsSent, sender.id
  );
  const isFriendAlreadyAdded = idExistsInIdsArr(
    sender.friends, receiver.id
  );

  throwIfNeeded(
    isReqAlreadySent, isReqAlreadySentByReceiver, isFriendAlreadyAdded
  )
}


function throwIfNeeded(
  isReqAlreadySent: boolean,
  isReqAlreadySentByReceiver: boolean,
  isFriendAlreadyAdded: boolean
) {
  if (isReqAlreadySent) {
    throw new ConflictErr("friend request already sent");
  }
  if (isReqAlreadySentByReceiver) {
    const msg = "this person has sent you a friend request. Accept it instead";
    throw new ConflictErr(msg);
  }
  if (isFriendAlreadyAdded) {
    throw new ConflictErr("friend already added");
  }
}
