import React, { useState } from "react";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import EventManager from "./EventManager";
import SlideManager from "./SlideManager";

const DashboardLayout = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <div>
      <AppBar position="static">
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Manage Events" />
          <Tab label="Manage Slides" />
        </Tabs>
      </AppBar>
      <Box p={3}>
        {tabIndex === 0 && <EventManager />}
        {tabIndex === 1 && <SlideManager />}
      </Box>
    </div>
  );
};

export default DashboardLayout;
