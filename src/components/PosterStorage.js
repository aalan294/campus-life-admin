import React, { useState, useEffect } from "react";
import { pinata } from "../config";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputLabel,
  Grid2,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const PosterStorage = () => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    image: null,
  });
  const [posters, setPosters] = useState([]);
  const [selectedPosterId, setSelectedPosterId] = useState(null);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(false);

  // Fetch posters from Firebase
  const fetchPosters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Posters"));
      const postersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosters(postersList);
    } catch (e) {
      console.error("Error fetching posters: ", e);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  // handleChange is used to update state, not call useState
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value, // Handle file input
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
    if (!formData.image) newErrors.image = "Image is required";
    return newErrors;
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const response = await pinata.upload.file(file);
      return response.cid; // Return CID
    } catch (error) {
      console.error("Error uploading to Pinata IPFS:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const cid = await handleImageUpload(formData.image);
      await addDoc(collection(db, "Posters"), {
        Title: formData.title,
        FormsLink: formData.link,
        Image: cid,
      });
      alert("Data Updated to DB !!");
      console.log("Submitted Data:", {
        ...formData,
        image: formData.image.name, // Log image file name
      });
      fetchPosters(); // Refresh the poster list
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreview = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handlePosterChange = async (e) => {
    const newSelectedPosterId = e.target.value;
    setSelectedPosterId(newSelectedPosterId);

    try {
      // Update the active poster in Firebase
      const posterRef = doc(db, "Posters", newSelectedPosterId);
      await updateDoc(posterRef, { isActive: true });

      // Deactivate other posters
      posters.forEach(async (poster) => {
        if (poster.id !== newSelectedPosterId) {
          const posterRef = doc(db, "Posters", poster.id);
          await updateDoc(posterRef, { isActive: false });
        }
      });
    } catch (error) {
      console.error("Error updating active poster: ", error);
    }
  };

  // Create object URL for preview
  const imagePreviewUrl =
    formData.image instanceof File ? URL.createObjectURL(formData.image) : null;

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
        Create Poster
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
            label="Link"
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
          <InputLabel htmlFor="image">Upload Image</InputLabel>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "block", marginTop: "8px" }}
          />
          {errors.image && <FormHelperText error>{errors.image}</FormHelperText>}
        </Grid2>
        <Grid2 xs={12}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={handlePreview}
            fullWidth
          >
            Preview
          </Button>
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

      {/* Poster List with Radio Buttons */}
      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
        Select Active Poster
      </Typography>
      <RadioGroup
        value={selectedPosterId}
        onChange={handlePosterChange}
        sx={{ marginBottom: 2 }}
      >
        {posters.map((poster) => (
          <FormControlLabel
            key={poster.id}
            value={poster.id}
            control={<Radio />}
            label={poster.Title}
          />
        ))}
      </RadioGroup>

      {/* Preview Modal */}
      <Modal open={openModal} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Poster Preview
          </Typography>
          <Typography variant="body1">
            <strong>Title:</strong> {formData.title}
          </Typography>
          <Typography variant="body1">
            <strong>Link:</strong> {formData.link}
          </Typography>
          {imagePreviewUrl && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={imagePreviewUrl}
                alt="Poster Preview"
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </Box>
          )}
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 3 }}
            onClick={handleClose}
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default PosterStorage;
