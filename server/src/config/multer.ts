import { Options } from "multer";
import path from "node:path";

const allowedFileExts = [".png", ".svg", ".jpg", ".jpeg", ".webp", ".avif", ".jfif", ".pjpeg", ".pjp", ".apng"]

const multerOptions: Options = {
  fileFilter(req, file, callback) {
    const fileExt = path.extname(file.originalname);

    if (allowedFileExts.includes(fileExt)) {
      callback(null, true);
    } else {
      const formattedAllowedFileExts = getFormattedAllowedFileExts();
      const err = new Error(
        `Forbidden file extension. You can only use ${formattedAllowedFileExts} extensions`
      );
      callback(err);
    }
  }
}

function getFormattedAllowedFileExts() {
  let result = "";
  allowedFileExts.forEach((ext, i) => (
    result += `${ext}${allowedFileExts.length - 1 === i ? "" : " "}`
  ));

  return result;
}

export default multerOptions;
