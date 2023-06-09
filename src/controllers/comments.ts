import Comment from "../models/Comment";
import Post from "../models/Post";
import deepCopy from "../utils/deepCopy";
import { NotFoundErr } from "../utils/errs";
import { findDocByIdAndUpdate } from "../utils/findDocs";
import { IReq, IRes } from "../utils/reqResInterfaces";


export async function getComments(req: IReq, res: IRes) {
  const { postPath } = req.params;
  const comments = await Comment.find({ onPost: postPath });
  res.status(200).json(comments);
}


export async function addComment(req: IReq, res: IRes) {
  const { postPath } = req.params;
  const { content, replyTo } = req.body;
  const { upload: imgsUpload, user: { userId } } = req.data;

  const comment = await Comment.create({
    createdBy: userId, onPost: postPath, content, replyTo, imgs: imgsUpload
  });

  res.status(201).json(comment);
}


export async function patchComment(req: IReq, res: IRes) {
  const { commentId } = req.params;
  const { replyTo } = req.body;
  const { content, comment } = req.data;
  
  const updatedComment = await findDocByIdAndUpdate(
    Comment,
    commentId,
    { ...comment, content, replyTo }
  )

  res.status(200).json(updatedComment);
}


export async function deleteComment(req: IReq, res: IRes) {
  const { commentId } = req.params;

  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) throw new NotFoundErr("comment not found");

  res.status(200).json(deletedComment);
}
