// components/RecruitmentManager.js

import React, { useState, useEffect } from 'react';
import api from '../API/api'; // Axios instance for API calls
import styled from 'styled-components';

// Styled-components for styling
const Container = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
  }

  &:hover {
    background-color: #0056b3;
  }
`;

const SuccessMessage = styled.div`
  background-color: #28a745;
  color: white;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
`;

const ErrorMessage = styled.div`
  background-color: #dc3545;
  color: white;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
`;

const RecruitmentList = styled.div`
  margin-top: 20px;
`;

const RecruitmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const RecruitmentManager = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all recruitment links
  const fetchRecruitments = async () => {
    try {
      const response = await api.get('/recruitments');
      setRecruitments(response.data);
    } catch (err) {
      setError('Error fetching recruitment links');
      console.error(err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await api.post('/recruitments', { title, url });
      setSuccess('Recruitment link added successfully!');
      setTitle('');
      setUrl('');
      fetchRecruitments(); // Refresh the list after adding a new recruitment
    } catch (err) {
      setError('Error adding recruitment link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recruitment link?')) {
      try {
        await api.delete(`/recruitments/${id}`);
        setRecruitments(recruitments.filter((recruitment) => recruitment._id !== id));
        setSuccess('Recruitment link deleted successfully!');
      } catch (err) {
        setError('Error deleting recruitment link');
        console.error(err);
      }
    }
  };

  // Fetch recruitment links when component mounts
  useEffect(() => {
    fetchRecruitments();
  }, []);

  return (
    <Container>
      <Title>Manage Recruitment Links</Title>
      {/* Form for adding recruitment link */}
      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Link'}
        </Button>
      </Form>

      {/* Success or Error Messages */}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Display all recruitment links */}
      <RecruitmentList>
        {recruitments.length > 0 ? (
          recruitments.map((recruitment) => (
            <RecruitmentItem key={recruitment._id}>
              <div>
                <strong>{recruitment.title}</strong>
                <br />
                <small>{recruitment.url}</small>
              </div>
              <DeleteButton onClick={() => handleDelete(recruitment._id)}>
                Delete
              </DeleteButton>
            </RecruitmentItem>
          ))
        ) : (
          <p>No recruitment links available.</p>
        )}
      </RecruitmentList>
    </Container>
  );
};

export default RecruitmentManager;
