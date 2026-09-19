// @desc   Upload a single evidence file (certificate / proof of work), returns its served URL
// @route  POST /api/uploads
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file was uploaded' });
  }

  return res.status(201).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
    },
  });
};

module.exports = { uploadFile };
