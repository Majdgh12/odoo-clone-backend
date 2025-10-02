// middleware/upload.js
import multer from "multer";
import path from "path";

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // files will be saved in /uploads folder (make sure it exists)
  },
  filename: (req, file, cb) => {
    // Get file extension
    const ext = path.extname(file.originalname);
    
    // Remove extension from original name, then sanitize it
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Replace spaces with hyphens and remove special characters
    const sanitizedName = nameWithoutExt
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '') // Remove special characters except hyphens and underscores
      .toLowerCase();                 // Convert to lowercase for consistency
    
    // Generate unique filename: timestamp-sanitizedname.ext
    const uniqueFilename = `${Date.now()}-${sanitizedName}${ext}`;
    
    console.log(`Original filename: ${file.originalname}`);
    console.log(`Sanitized filename: ${uniqueFilename}`);
    
    cb(null, uniqueFilename);
  },
});

// Optional: filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

export default upload;