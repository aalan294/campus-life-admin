import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { pinata } from "../config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Container = styled.div`
  background-color: #f9f9f9;
  color: #333;
  padding: 2rem;
  font-family: Arial, sans-serif;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  && {
    background-color: #007bff;
    color: #fff;
    &:hover {
      background-color: #0056b3;
    }
  }
`;

const StyledTableContainer = styled(TableContainer)`
  && {
    margin-top: 1.5rem;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

const StyledTableCell = styled(TableCell)`
  && {
    color: #555;
    font-weight: bold;
  }
`;

const ActionsButton = styled(Button)`
  && {
    background-color: #dc3545;
    color: #fff;
    &:hover {
      background-color: #a71d2a;
    }
  }
`;

const SlideManager = () => {
  const [slides, setSlides] = useState([]);
  const [transformedSlides, setTransformedSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    imageFile: null,
    order: 0,
    active: false,
  });

  const fetchSlides = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "homepageSlides"));
      const slidesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSlides(slidesData);
      transformSlides(slidesData); // Transform slides after fetching
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const transformSlides = async (slidesArray) => {
    try {
      const transformed = await Promise.all(
        slidesArray.map(async (slide) => {
          const signedUrl = await getSignedUrl(slide.imageUrl);
          return { ...slide, signedUrl };
        })
      );
      setTransformedSlides(transformed);
    } catch (error) {
      console.error("Error transforming slides:", error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileChange = (e) => {
    setNewSlide((prev) => ({ ...prev, imageFile: e.target.files[0] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSlide((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadToIPFS = async (file) => {
    try {
      const response = await pinata.upload.file(file);
      return response.cid; // Return CID
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload to IPFS");
    }
  };

  const getSignedUrl = async (cid) => {
    try {
      const signedUrl = await pinata.gateways.createSignedURL({
        cid,
        expires: 60,
      });
      return signedUrl;
    } catch (err) {
      console.error("Error fetching signed URL:", err);
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSlide.imageFile) {
      alert("Please upload an image!");
      return;
    }

    try {
      const cid = await uploadToIPFS(newSlide.imageFile);
      await addDoc(collection(db, "homepageSlides"), {
        title: newSlide.title,
        imageUrl: cid,
        order: parseInt(newSlide.order, 10),
        active: newSlide.active,
      });

      setNewSlide({
        title: "",
        imageFile: null,
        order: 0,
        active: false,
      });
      fetchSlides(); // Refetch slides after addition
    } catch (error) {
      console.error("Error adding slide:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "homepageSlides", id));
      fetchSlides(); // Refetch slides after deletion
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  const toggleActive = async (id, currentState) => {
    try {
      await updateDoc(doc(db, "homepageSlides", id), {
        active: !currentState,
      });
      fetchSlides(); // Refetch slides after update
    } catch (error) {
      console.error("Error updating slide:", error);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          value={newSlide.title}
          onChange={handleInputChange}
          required
        />
        <input type="file" accept="image/*" onChange={handleFileChange} required />
        <TextField
          label="Display Order"
          name="order"
          type="number"
          value={newSlide.order}
          onChange={handleInputChange}
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              name="active"
              checked={newSlide.active}
              onChange={handleInputChange}
            />
          }
          label="Active"
        />
        <StyledButton type="submit" variant="contained">
          Add Slide
        </StyledButton>
      </Form>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Title</StyledTableCell>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Order</StyledTableCell>
              <StyledTableCell>Active</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transformedSlides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>{slide.title}</TableCell>
                <TableCell>
                  {slide.signedUrl && (
                    <img
                      src={slide.signedUrl}
                      alt={slide.title}
                      style={{ width: "100px" }}
                    />
                  )}
                </TableCell>
                <TableCell>{slide.order}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={slide.active}
                    onChange={() => toggleActive(slide.id, slide.active)}
                  />
                </TableCell>
                <TableCell>
                  <ActionsButton
                    variant="contained"
                    onClick={() => handleDelete(slide.id)}
                  >
                    Delete
                  </ActionsButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Container>
  );
};

export default SlideManager;