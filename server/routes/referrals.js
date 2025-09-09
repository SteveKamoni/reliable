const express = require("express");
const multer = require("multer");
const { referralSchema } = require("../validation/schemas"); // Joi schema
const airtableService = require("../services/airtableService");

const router = express.Router();

// Multer configuration for in-memory uploads (5MB max)
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
    // Joi validation
    const { error, value: formData } = referralSchema.validate(req.body, {
      abortEarly: false, // collect all errors
      stripUnknown: true, // remove unknown fields
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }

    // Check for duplicates by email
    const isDuplicate = await airtableService.checkDuplicate(formData.Email);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "A referral with this email already exists.",
      });
    }

    // Handle attachment if present
    if (req.file) {
      try {
        const attachment = await airtableService.uploadAttachment(req.file);
        formData.Attachments = [attachment];
      } catch (fileError) {
        return res.status(400).json({
          success: false,
          message: "File upload failed",
          error: fileError.message,
        });
      }
    }

    // Create record in Airtable
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

// GET /test (Airtable connectivity)
router.get("/test", async (req, res) => {
  try {
    const response = await airtableService.checkDuplicate(""); // lightweight test
    res.json({ success: true, message: "Airtable connection successful" });
  } catch (error) {
    console.error("Airtable test error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
