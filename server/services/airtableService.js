const axios = require("axios");

class AirtableService {
  constructor() {
    this.baseURL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
    this.headers = {
      Authorization: `Bearer ${process.env.AIRTABLE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    // Using Airtable field IDs instead of names
    this.fieldMap = {
      FirstName: "First Name",
      LastName: "Last Name",
      Phone: "Phone",
      Email: "Email",
      Message: "Message",
      SubmissionDate: "Submission Date",
    };
  }

  async createRecord(data) {
    try {
      const fields = {};

      // Map data keys to Airtable field IDs
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && this.fieldMap[key]) {
          fields[this.fieldMap[key]] = data[key];
        }
      });

      // Add submission date if not present
      if (!fields[this.fieldMap.SubmissionDate]) {
        const today = new Date();
        fields[this.fieldMap.SubmissionDate] = today
          .toISOString()
          .split("T")[0];
      }

      console.log(
        "Posting to:",
        `${this.baseURL}/${process.env.AIRTABLE_TABLE_ID}`
      );
      console.log("Mapped fields:", fields);

      const response = await axios.post(
        `${this.baseURL}/${process.env.AIRTABLE_TABLE_ID}`,
        { fields },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error("Airtable API Error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      throw new Error(
        `Failed to create record: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  async checkDuplicate(email) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${process.env.AIRTABLE_TABLE_ID}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `{${this.fieldMap.Email}} = "${email}"`,
            maxRecords: 1,
          },
        }
      );
      return response.data.records.length > 0;
    } catch (error) {
      console.error("Duplicate check error:", error.message);
      return false;
    }
  }
}

module.exports = new AirtableService();
