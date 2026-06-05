import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();

    cb(
      null,
      uniqueSuffix + file.originalname
    );
  },
});

const upload = multer({
  storage,
});

export default upload;