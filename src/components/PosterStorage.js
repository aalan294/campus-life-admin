import React, { useState, useEffect } from "react";
import { pinata } from "../config";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputLabel,
  Grid2,
  FormHelperText,
  Modal,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const PosterStorage = () => {
  const [formData, setFormData] = useState({
    title: "",
    image: null,
  });
  const [posters, setPosters] = useState([]);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [posterUrls, setPosterUrls] = useState({});

  // Fetch posters from Firebase
  const fetchPosters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Posters"));
      const postersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosters(postersList);

      // Fetch image URLs for all posters
      const urls = {};
      for (const poster of postersList) {
        if (poster.Image) {
          try {
            const url = await getSignedUrl(poster.Image);
            urls[poster.id] = url;
          } catch (error) {
            console.error(`Error getting URL for poster ${poster.id}:`, error);
          }
        }
        else{
          console.log("not fondraa");
        }
      }
      setPosterUrls(urls);
    } catch (e) {
      console.error("Error fetching posters: ", e);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.image) newErrors.image = "Image is required";
    return newErrors;
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    try {
      const response = await pinata.upload.file(file);
      return response.cid;
    } catch (error) {
      console.error("Error uploading to Pinata IPFS:", error);
      return null;
    }
  };

  const getSignedUrl = async (cid) => {
    try {
      const signedUrl = await pinata.gateways.createSignedURL({
        cid: cid,
        expires: 600,
      });
      return signedUrl;
    } catch (err) {
      console.error('Error fetching signed URL:', err);
      return '';
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
      console.log(cid);
      await addDoc(collection(db, "Posters"), {
        Title: formData.title,
        Image: cid,
      });
      alert("Poster Added Successfully!");
      setFormData({ title: "", image: null }); // Reset form
      fetchPosters(); // Refresh the poster list
    } catch (e) {
      console.error(e);
      alert("Error adding poster. Please try again.");
    }
  };

  const handleDelete = async (posterId) => {
    if (window.confirm("Are you sure you want to delete this poster?")) {
      try {
        await deleteDoc(doc(db, "Posters", posterId));
        alert("Poster deleted successfully!");
        fetchPosters();
      } catch (error) {
        console.error("Error deleting poster:", error);
        alert("Error deleting poster. Please try again.");
      }
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

  const imagePreviewUrl =
    formData.image instanceof File ? URL.createObjectURL(formData.image) : null;

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", padding: 3 }}>
      {/* Upload Form */}
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
          marginBottom: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Upload New Poster
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
          <Grid2 xs={12} sm={6}>
            <Button
              type="button"
              variant="outlined"
              onClick={handlePreview}
              fullWidth
            >
              Preview
            </Button>
          </Grid2>
          <Grid2 xs={12} sm={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Upload
            </Button>
          </Grid2>
        </Grid2>
      </Box>

      {/* Posters Grid */}
      <Typography variant="h5" component="h2" gutterBottom>
        Uploaded Posters
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
        }}
      >
        {posters.map((poster) => (
          <Card key={poster.id} sx={{ height: "100%" }}>
            <CardMedia
              component="img"
              height="200"
              image={posterUrls[poster.id]}
              alt={poster.Title}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" noWrap>
                {poster.Title}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton
                color="error"
                onClick={() => handleDelete(poster.id)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

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