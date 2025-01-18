import React, { useState, useEffect } from 'react';
import api from '../API/api.js';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  font-family: 'Arial', sans-serif;
  background-color: #fff;
  color: #333;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #1e3a8a;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
`;

const FormWrapper = styled.form`
  background-color: #f4f7fc;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputField = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #1e3a8a;
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  &:focus {
    border-color: #1e3a8a;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  resize: vertical;
  &:focus {
    border-color: #1e3a8a;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #1e3a8a;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: #1e50a2;
  }
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const EventsSection = styled.div`
  margin-top: 40px;
`;

const EventsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHead = styled.th`
  background-color: #1e3a8a;
  color: white;
  padding: 12px;
  text-align: left;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 12px;
  text-align: left;
`;

const DeleteButton = styled.button`
  background-color: #e53e3e;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c53030;
  }
`;

const Error = styled.p`
  color: #e53e3e;
  text-align: center;
  font-size: 1rem;
`;

const Success = styled.p`
  color: #38a169;
  text-align: center;
  font-size: 1rem;
`;

const EventManager = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [formLink, setFormLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [image, setImage] = useState(null); // For storing the image file
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState([]); // For storing all events

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      if (response.status === 200) {
        setEvents(response.data.events);
      }
    } catch (err) {
      setError('Error fetching events. Please try again later.');
      console.error(err);
    }
  };

  // Delete an event
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      if (response.status === 200) {
        setSuccess('Event deleted successfully!');
        fetchEvents(); // Fetch the updated list of events after deletion
      }
    } catch (err) {
      setError('Error deleting event. Please try again later.');
      console.error(err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('fee', fee);
    formData.append('maxParticipants', maxParticipants);
    formData.append('formLink', formLink);
    formData.append('eventDate', eventDate);

    // Append image if exists
    if (image) {
      formData.append('image', image);
    }

    try {
      // Send POST request to backend
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess('Event created successfully!');
        // Reset the form fields
        setTitle('');
        setDescription('');
        setFee('');
        setMaxParticipants('');
        setFormLink('');
        setEventDate('');
        setImage(null);
        fetchEvents(); // Fetch the updated list of events
      }
    } catch (err) {
      setError('Error creating event. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Container>
      <Title>Create New Event</Title>
      <FormWrapper onSubmit={handleSubmit}>
        <InputField>
          <Label>Title</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Description</Label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Fee</Label>
          <Input
            type="text"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Max Participants</Label>
          <Input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Form Link</Label>
          <Input
            type="url"
            value={formLink}
            onChange={(e) => setFormLink(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Event Date</Label>
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </InputField>
        <InputField>
          <Label>Upload Event Image (Optional)</Label>
          <Input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </InputField>
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Event'}
        </Button>
      </FormWrapper>

      {error && <Error>{error}</Error>}
      {success && <Success>{success}</Success>}

      <EventsSection>
        <Title>All Events</Title>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <EventsTable>
            <thead>
              <tr>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Action</TableHead>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                  <TableCell>{event.fee}</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => handleDelete(event._id)}>
                      Delete
                    </DeleteButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </EventsTable>
        )}
      </EventsSection>
    </Container>
  );
};

export default EventManager;
