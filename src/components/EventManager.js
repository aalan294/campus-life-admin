import React, { useState, useEffect } from "react";
import { pinata } from "../config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

// Helper function to format dates
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date)) {
      return date.toLocaleString();
    }
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Main component
const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    fee: 0,
    imageUrl: "",
    startDate: "",
    endDate: "",
    maxParticipants: 0,
    registrationDeadline: "",
    registrationRequired: false,
    sheet: "",
    slug: "",
    status: "",
    venue: "",
    file: null,
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle input changes for new event
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file upload to Pinata IPFS
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

  // Add a new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload the image to Pinata
      const cid = await handleImageUpload(newEvent.file);
      if (!cid) {
        alert("Failed to upload image. Please try again.");
        return;
      }
  
      // Prepare event data to be saved to Firestore
      const eventData = {
        ...newEvent,
        imageUrl: cid, // Use the uploaded image CID
        fee: parseFloat(newEvent.fee),
        maxParticipants: parseInt(newEvent.maxParticipants, 10),
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        registrationDeadline: new Date(newEvent.registrationDeadline),
      };
  
      // Exclude the 'file' field from the event data before sending to Firestore
      const { file, ...finalEventData } = eventData;
  
      // Add the new event to Firestore
      await addDoc(collection(db, "events"), finalEventData);
  
      // Reset the newEvent state
      setNewEvent({
        title: "",
        description: "",
        fee: 0,
        imageUrl: "",
        startDate: "",
        endDate: "",
        maxParticipants: 0,
        registrationDeadline: "",
        registrationRequired: false,
        sheet: "",
        slug: "",
        status: "",
        venue: "",
        file: null, // Reset file input as well
      });
  
      // Fetch the updated events
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };
  

  // Open edit dialog
  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  // Handle changes in edit dialog
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save edited event
  const handleEditSave = async () => {
    try {
      const eventDoc = doc(db, "events", editingEvent.id);
      await updateDoc(eventDoc, editingEvent);
      setIsEditDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}
      >
        <TextField
          label="Title"
          name="title"
          value={newEvent.title}
          onChange={handleChange}
          required
        />
        <TextField
          label="Description"
          name="description"
          value={newEvent.description}
          onChange={handleChange}
          required
          multiline
          rows={3}
        />
        <TextField
          label="Fee"
          name="fee"
          type="number"
          value={newEvent.fee}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewEvent((prev) => ({ ...prev, file: e.target.files[0] }))
          }
          required
        />
        <TextField
          label="Start Date"
          name="startDate"
          type="datetime-local"
          value={newEvent.startDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="End Date"
          name="endDate"
          type="datetime-local"
          value={newEvent.endDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Max Participants"
          name="maxParticipants"
          type="number"
          value={newEvent.maxParticipants}
          onChange={handleChange}
          required
        />
        <TextField
          label="Registration Deadline"
          name="registrationDeadline"
          type="datetime-local"
          value={newEvent.registrationDeadline}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              name="registrationRequired"
              checked={newEvent.registrationRequired}
              onChange={handleChange}
            />
          }
          label="Registration Required"
        />
        <TextField
          label="Sheet URL"
          name="sheet"
          value={newEvent.sheet}
          onChange={handleChange}
        />
        <TextField
          label="Slug"
          name="slug"
          value={newEvent.slug}
          onChange={handleChange}
          required
        />
        <TextField
          label="Status"
          name="status"
          value={newEvent.status}
          onChange={handleChange}
          required
        />
        <TextField
          label="Venue"
          name="venue"
          value={newEvent.venue}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Event
        </Button>
      </form>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{formatDate(event.startDate)}</TableCell>
                <TableCell>{formatDate(event.endDate)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(event)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "events", event.id));
                        fetchEvents();
                      } catch (error) {
                        console.error("Error deleting event:", error);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          {editingEvent && (
            <>
              <TextField
                label="Title"
                name="title"
                value={editingEvent.title}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={editingEvent.description}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Fee"
                name="fee"
                value={editingEvent.fee}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Start Date"
                name="startDate"
                type="datetime-local"
                value={editingEvent.startDate}
                onChange={handleEditChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                name="endDate"
                type="datetime-local"
                value={editingEvent.endDate}
                onChange={handleEditChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Max Participants"
                name="maxParticipants"
                value={editingEvent.maxParticipants}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Registration Deadline"
                name="registrationDeadline"
                type="datetime-local"
                value={editingEvent.registrationDeadline}
                onChange={handleEditChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="registrationRequired"
                    checked={editingEvent.registrationRequired}
                    onChange={handleEditChange}
                  />
                }
                label="Registration Required"
              />
              <TextField
                label="Sheet URL"
                name="sheet"
                value={editingEvent.sheet}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Slug"
                name="slug"
                value={editingEvent.slug}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Status"
                name="status"
                value={editingEvent.status}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Venue"
                name="venue"
                value={editingEvent.venue}
                onChange={handleEditChange}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventManager;
