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
  limits:{
        fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

export default upload;