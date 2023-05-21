import { NextFunction } from "express";
import { HydratedDocument } from "mongoose";
import Comment, { IComment, ICommentImg } from "../../../models/Comment";
import deepCopy from "../../../utils/deepCopy";
import { findDocByIdAndUpdate } from "../../../utils/findDocs";
import { IReq, IRes } from "../../../utils/reqResInterfaces";
import { convertFilesToDeleteIdsToArr } from "./validator";

export default async function patchCommentDeleteImgsIfNeeded(req: IReq, res: IRes, next: NextFunction) {
  const { filesToDeleteIds } = req.body;
  const { commentId } = req.params;
  const filesToDeleteIdsArr = convertFilesToDeleteIdsToArr(filesToDeleteIds);
  const comment: IComment = deepCopy(req.data.comment);
  const updatedImgsArr = deepCopy(comment.imgs)
    .filter(imgObj => filterImgs(imgObj, filesToDeleteIdsArr));

  comment.imgs = updatedImgsArr;

  req.data.comment = deepCopy(comment);
  next();
}


function filterImgs(imgObj: ICommentImg, filesToDeleteIds: string[]) {
  const id = imgObj.id;

  if (!id) return true; // include if the img is newly uploaded
  if (filesToDeleteIds.includes(id.toString())) return false;
  return true; // include if the img id is not contained in the array of ids of imgs to delete
}
