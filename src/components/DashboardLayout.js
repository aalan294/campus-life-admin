import React, { useState } from "react";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import EventManager from "./EventManager";
import SlideManager from "./SlideManager";
import PosterStorage from "./PosterStorage"
import RecruitmentForm from "./Recruitment Form";
import HighlightManager from "./HighlightManager";

const DashboardLayout = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <div>
      <AppBar position="static">
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Manage Events" sx={{
            color: "white", // Default color
            "&.Mui-selected": { color: "black", backgroundColor: 'white' }, // Selected color
          }} />
          <Tab label="Manage Slides" sx={{
            color: "white", // Default color
            "&.Mui-selected": { color: "black", backgroundColor: 'white' }, // Selected color
          }} />
          <Tab label="Poster Popup"sx={{
            color: "white", // Default color
            "&.Mui-selected": { color: "black", backgroundColor: 'white' }, // Selected color
          }} />
          <Tab label="Recruitment"sx={{
            color: "white", // Default color
            "&.Mui-selected": { color: "black", backgroundColor: 'white' }, // Selected color
          }} />
          <Tab label="Highlight"sx={{
            color: "white", // Default color
            "&.Mui-selected": { color: "black", backgroundColor: 'white' }, // Selected color
          }} />

        </Tabs>
      </AppBar>
      <Box p={3}>
        {tabIndex === 0 && <EventManager />}
        {tabIndex === 1 && <SlideManager />}
        {tabIndex === 2 && <PosterStorage />}
        {tabIndex === 3 && <RecruitmentForm />}
        {tabIndex === 4 && <HighlightManager/>}


      </Box>
    </div>
  );
};

export default DashboardLayout;
