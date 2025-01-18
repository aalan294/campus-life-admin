import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Box, Button, TextField, Typography, Grid2, FormHelperText } from "@mui/material";

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.link) newErrors.link = "Link is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addDoc(collection(db, "RecruitmentForms"), {
        Title: formData.title,
        GoogleFormLink: formData.link,
      });
      alert("Form data successfully uploaded to Firebase!");
      setFormData({ title: "", link: "" }); // Clear form after submission
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        margin: "auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Create Recruitment Form
      </Typography>
      <Grid2 container spacing={2}>
        <Grid2 xs={12}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            variant="outlined"
          />
        </Grid2>
        <Grid2 xs={12}>
          <TextField
            label="Google Form Link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            error={!!errors.link}
            helperText={errors.link}
            fullWidth
            variant="outlined"
          />
        </Grid2>
        <Grid2 xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Submit
          </Button>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default RecruitmentForm;
