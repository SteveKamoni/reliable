import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { referralSchema } from "../schemas/referralSchema";
import { referralAPI } from "../services/api";
import styles from "../styles/ReferralForm.module.scss";

const ReferralForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(referralSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key]) formData.append(key, data[key]);
      });
      if (selectedFile) formData.append("attachment", selectedFile);

      await referralAPI.submit(formData);

      toast.success("Referral submitted successfully!");
      reset();
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <h2 className={styles.title}>Referral Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* First Name */}
        <div className={styles.group}>
          <label>First Name *</label>
          <input
            type="text"
            {...register("FirstName")}
            placeholder="Enter your first name"
            className={errors.FirstName ? styles.error : ""}
          />
          {errors.FirstName && <p className={styles.errorMsg}>{errors.FirstName.message}</p>}
        </div>

        {/* Last Name */}
        <div className={styles.group}>
          <label>Last Name *</label>
          <input
            type="text"
            {...register("LastName")}
            placeholder="Enter your last name"
            className={errors.LastName ? styles.error : ""}
          />
          {errors.LastName && <p className={styles.errorMsg}>{errors.LastName.message}</p>}
        </div>

        {/* Phone */}
        <div className={styles.group}>
          <label>Phone *</label>
          <input
            type="tel"
            {...register("Phone")}
            placeholder="Enter your phone number"
            className={errors.Phone ? styles.error : ""}
          />
          {errors.Phone && <p className={styles.errorMsg}>{errors.Phone.message}</p>}
        </div>

        {/* Email */}
        <div className={styles.group}>
          <label>Email *</label>
          <input
            type="email"
            {...register("Email")}
            placeholder="Enter your email"
            className={errors.Email ? styles.error : ""}
          />
          {errors.Email && <p className={styles.errorMsg}>{errors.Email.message}</p>}
        </div>

        {/* Message */}
        <div className={styles.group}>
          <label>Message</label>
          <textarea
            {...register("Message")}
            rows={4}
            placeholder="Enter your message (optional)"
            className={errors.Message ? styles.error : ""}
          />
          {errors.Message && <p className={styles.errorMsg}>{errors.Message.message}</p>}
        </div>

        {/* File Upload */}
        <div className={styles.group}>
          <label>Attachment</label>
          <input type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.txt" />
          {selectedFile && <p className={styles.fileSelected}>Selected: {selectedFile.name}</p>}
          <p className={styles.fileInfo}>Accepted: JPG, PNG, PDF, TXT (max 5MB)</p>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? "Submitting..." : "Submit Referral"}
        </button>
      </form>
    </div>
  );
};

export default ReferralForm;
