import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Box, Button, TextField, Typography, Grid2, FormHelperText, Modal } from "@mui/material";

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
  });
  const [forms, setForms] = useState([]);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [editFormId, setEditFormId] = useState(null);

  // Fetch forms from Firebase
  const fetchForms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "RecruitmentForms"));
      const formsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setForms(formsList);
    } catch (e) {
      console.error("Error fetching forms: ", e);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

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
      if (editFormId) {
        // Update existing form
        const formRef = doc(db, "RecruitmentForms", editFormId);
        await updateDoc(formRef, {
          Title: formData.title,
          GoogleFormLink: formData.link,
        });
        setEditFormId(null);
      } else {
        // Add new form
        await addDoc(collection(db, "RecruitmentForms"), {
          Title: formData.title,
          GoogleFormLink: formData.link,
        });
      }
      alert("Form data successfully submitted!");
      setFormData({ title: "", link: "" }); // Clear form after submission
      fetchForms(); // Refresh form list
    } catch (e) {
      console.error("Error adding/updating document: ", e);
    }
  };

  const handleEdit = (form) => {
    setFormData({ title: form.Title, link: form.GoogleFormLink });
    setEditFormId(form.id);
  };

  const handleDelete = async (formId) => {
    try {
      await deleteDoc(doc(db, "RecruitmentForms", formId));
      alert("Form successfully deleted!");
      fetchForms(); // Refresh form list
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
        Create or Edit Recruitment Form
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
            {editFormId ? "Update" : "Submit"}
          </Button>
        </Grid2>
      </Grid2>

      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
        Uploaded Forms
      </Typography>
      <Box>
        {forms.map((form) => (
          <Box
            key={form.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              padding: "8px 0",
            }}
          >
            <Typography variant="body1">{form.Title}</Typography>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleEdit(form)}
                sx={{ marginRight: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleDelete(form.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RecruitmentForm;
