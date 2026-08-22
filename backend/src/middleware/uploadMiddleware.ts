import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

const uploadPath = path.join(os.tmpdir(), "talktoit-files");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

console.log("UPLOAD PATH:", uploadPath);
console.log("UPLOAD PATH EXISTS:", fs.existsSync(uploadPath));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export default upload;