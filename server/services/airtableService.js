const axios = require("axios");

class AirtableService {
  constructor() {
    this.baseURL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
    this.headers = {
      Authorization: `Bearer ${process.env.AIRTABLE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    // Map frontend keys to Airtable field names
    this.fieldMap = {
      FirstName: "First Name",
      LastName: "Last Name",
      Phone: "Phone",
      Email: "Email",
      Message: "Message",
      Attachments: "Attachments",
    };
  }

  /**
   * Create a new record in Airtable
   * @param {Object} data - Form data
   * @param {Object|null} attachment - Optional attachment in Airtable format
   * @returns {Object} Airtable response data
   */
  async createRecord(data, attachment = null) {
    try {
      const fields = {};

      // Map frontend data to Airtable fields
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && this.fieldMap[key]) {
          fields[this.fieldMap[key]] = data[key];
        }
      });

      fields[this.fieldMap.SubmissionDate] = new Date().toISOString();

      // Add attachment if provided
      if (attachment) {
        fields[this.fieldMap.Attachments] = [attachment];
      }

      const response = await axios.post(
        `${this.baseURL}/${process.env.AIRTABLE_TABLE_ID}`,
        { fields },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Airtable API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `Failed to create record: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Check if a record with the given email already exists
   * @param {string} email
   * @returns {boolean}
   */
  async checkDuplicate(email) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${process.env.AIRTABLE_TABLE_ID}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `{Email} = "${email}"`,
            maxRecords: 1,
          },
        }
      );
      return response.data.records.length > 0;
    } catch (error) {
      console.error("Duplicate check error:", error.message);
      return false; // Allow submission if check fails
    }
  }

  /**
   * Process an uploaded file for Airtable
   * @param {Object} file - Multer file object
   * @returns {Object} Airtable-compatible attachment
   */
  async processAttachment(file) {
    try {
      // Airtable supports URLs; base64 works for small files
      return {
        filename: file.originalname,
        url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      };
    } catch (error) {
      console.error("Attachment processing error:", error.message);
      throw new Error("Failed to process attachment");
    }
  }
}

module.exports = new AirtableService();
