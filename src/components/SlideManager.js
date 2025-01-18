import React, { useState, useEffect } from 'react';
import api from '../API/api'; // Import the Axios instance from api.js
import styled from 'styled-components';

const SlideManager = () => {
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [slides, setSlides] = useState([]); // To store all the slides

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Create FormData to send the image and eventName
    const formData = new FormData();
    formData.append('eventName', eventName);
    if (image) {
      formData.append('image', image); // Ensure 'image' is appended correctly
    }

    try {
      const response = await api.post('/events/slide', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      setSuccess('Slide image uploaded successfully!');
      setEventName('');
      setImage(null);
      fetchSlides(); // Refresh the slides list after successful upload
    } catch (err) {
      setError('Error uploading slide image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all slides from the database
  const fetchSlides = async () => {
    try {
      const response = await api.get('/events/slide');
      setSlides(response.data); // Set the slides data
    } catch (err) {
      console.error('Error fetching slides:', err);
    }
  };

  // Delete a specific slide
  const handleDelete = async (id, imageName) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        await api.delete(`/events/slide/${id}`);
        setSlides(slides.filter((slide) => slide._id !== id)); // Remove deleted slide from the list
        setSuccess('Slide deleted successfully!');
      } catch (err) {
        setError('Error deleting slide');
        console.error('Error deleting slide:', err);
      }
    }
  };

  // Fetch slides when the component mounts
  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <Container>
      <Title>Upload Slide Image</Title>

      {/* Form to upload slide */}
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="eventName">Event Name</Label>
          <Input
            type="text"
            id="eventName"
            name="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="image">Image</Label>
          <Input
            type="file"
            id="image"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </Form>

      {/* Display success or error messages */}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Section to display all uploaded slides */}
      <SlidesSection>
        <h3>All Uploaded Slides</h3>
        <SlidesList>
          {slides.length > 0 ? (
            slides.map((slide) => (
              <SlideItem key={slide._id}>
                <SlideImage src={`https://campus-life-server.onrender.com/${slide.image}`} alt={slide.eventName} />
                <SlideInfo>
                  <strong>{slide.eventName}</strong> <br />
                  <small>{slide.image}</small>
                </SlideInfo>
                <DeleteButton onClick={() => handleDelete(slide._id, slide.image)}>
                  Delete
                </DeleteButton>
              </SlideItem>
            ))
          ) : (
            <NoSlides>No slides uploaded yet.</NoSlides>
          )}
        </SlidesList>
      </SlidesSection>
    </Container>
  );
};

export default SlideManager;

// Styled Components

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #aaa;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const SlidesSection = styled.section`
  margin-top: 30px;
`;

const SlidesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const SlideItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  width: 200px;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const SlideImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
`;

const SlideInfo = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #555;
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #c82333;
  }
`;

const NoSlides = styled.p`
  color: #888;
  font-style: italic;
`;
