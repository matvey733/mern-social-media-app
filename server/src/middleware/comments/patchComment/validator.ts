import { NextFunction } from "express";
import Comment, { IComment } from "../../../models/Comment";
import validateObjectId from "../../../utils/validateObjectId";
import checkReplyToCommentExists from "../../../utils/checkReplyToCommentExists";
import deepCopy from "../../../utils/deepCopy";
import { BadRequestErr, ForbiddenErr, NotFoundErr } from "../../../utils/errs";
import { IReq, IRes } from "../../../utils/reqResInterfaces";
import validateFileCount from "../../../utils/validateFileCount";


export default async function patchCommentValidator(req: IReq, res: IRes, next: NextFunction) {
  const { commentId } = req.params;
  const { replyTo } = req.body;
  validateObjectId(commentId);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundErr("comment not found");

  checkTryingToPatchOwnComment(req, comment);
  await checkReplyToCommentExists(replyTo);
  validateFileCount(req, comment);

  req.data.comment = deepCopy(comment);
  next();
}


function checkTryingToPatchOwnComment(req: IReq, comment: IComment) {
  const { userId } = req.data.user;
  const { createdBy: createdByObj } = comment;
  const createdBy = createdByObj.toString();

  if (userId !== createdBy) {
    throw new ForbiddenErr("you can only update your own comments");
  }
}
