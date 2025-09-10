const express = require("express");
const multer = require("multer");
const { referralSchema } = require("../validation/schemas"); // Joi schema
const airtableService = require("../services/airtableService");

const router = express.Router();

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, PDF, and TXT are allowed."
        )
      );
  },
});

// POST /submit
router.post("/submit", upload.single("attachment"), async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    // Validate input
    const { error, value: formData } = referralSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }

    // Check for duplicates
    const isDuplicate = await airtableService.checkDuplicate(formData.Email);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "A referral with this email already exists.",
      });
    }

    // Handle attachment
    if (req.file) {
      const attachment = await airtableService.processAttachment(req.file);
      formData.Attachments = [attachment];
    }

    // Create record
    const result = await airtableService.createRecord(formData);

    return res.status(201).json({
      success: true,
      message: "Referral submitted successfully!",
      recordId: result.id,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /test
router.get("/test", async (req, res) => {
  try {
    const response = await airtableService.checkDuplicate(""); // simple test
    res.json({ success: true, message: "Airtable connection successful" });
  } catch (error) {
    console.error("Airtable test error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
