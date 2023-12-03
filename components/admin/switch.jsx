// src/Settings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [setTimer, setSetTimer] = useState(null);
  const [turnOffTimer, setTurnOffTimer] = useState(null);
  const [switchResponses, setSwitchResponses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [timerConditionMet, setTimerConditionMet] = useState(false);
  const [turnOffTimerConditionMet, setTurnOffTimerConditionMet] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3002/stuffs');
        const data = response.data.map((stuff) => ({
          ipAddress: stuff.ip_address,
          location: stuff.location,
        }));
        setSettings(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };

    fetchData();
    const intervalId = setInterval(updateCurrentTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const updateSwitches = async () => {
      const responses = [];

      settings.forEach(async (setting) => {
        const { ipAddress } = setting;

        // Turn on the switch
        if (setTimer && currentTime >= setTimer) {
          try {
            const response = await updateSwitchStatus(ipAddress, true);
            responses.push({ ipAddress, response });
          } catch (error) {
            console.error(`Error updating switch status for ${ipAddress}:`, error);
          }
        }

        // Turn off the switch
        if (turnOffTimer && currentTime >= turnOffTimer) {
          try {
            const response = await updateSwitchStatus(ipAddress, false);
            responses.push({ ipAddress, response });
          } catch (error) {
            console.error(`Error updating switch status for ${ipAddress}:`, error);
          }
        }
      });

      setSwitchResponses(responses);
      setSuccessMessage('All switches set successfully.');
    };

    updateSwitches();

    // Check timer conditions and set states
    setTimerConditionMet(setTimer && currentTime >= setTimer);
    setTurnOffTimerConditionMet(turnOffTimer && currentTime >= turnOffTimer);

  }, [currentTime, settings, setTimer, turnOffTimer]);

  const updateSwitchStatus = async (ipAddress, newSwitchState) => {
    try {
      const response = await axios.post(`http://${ipAddress}/setparams`, {
        switch: newSwitchState ? 1 : 0,
      });
      return response.data; // Assuming the response contains relevant information
    } catch (error) {
      throw error;
    }
  };

  const handleSetTimerChange = (event) => {
    const inputTime = event.target.value;
    const [hours, minutes] = inputTime.split(':');
    const timerDate = new Date();
    timerDate.setHours(hours);
    timerDate.setMinutes(minutes);
    setSetTimer(timerDate);
  };

  const handleSetTimerOffChange = (event) => {
    const inputTime = event.target.value;
    const [hours, minutes] = inputTime.split(':');
    const turnOffTimerDate = new Date();
    turnOffTimerDate.setHours(hours);
    turnOffTimerDate.setMinutes(minutes);
    setTurnOffTimer(turnOffTimerDate);
  };

  const handleSetTimerClick = () => {
    setSwitchResponses([]);
    setSuccessMessage('');
    // Additional logic if needed before setting the timer
  };

  const handleSetTimerOffClick = () => {
    // Additional logic if needed before setting the turn off timer
  };

  return (
    <div className="container">
      <div className="clock display-4 mt-3 mb-3">
        {currentTime.toLocaleTimeString()}
      </div>
      <div className="mb-3">
        <label className="form-label">Set Timer (HH:mm): </label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g., 08:30"
          onChange={handleSetTimerChange}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleSetTimerClick}
        >
          Set Timer
        </button>
        {successMessage && <div className="text-success mt-2">{successMessage}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label">Set Timer Off (HH:mm): </label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g., 20:00"
          onChange={handleSetTimerOffChange}
        />
        <button
          className="btn btn-danger mt-2"
          onClick={handleSetTimerOffClick}
        >
          Set Timer Off
        </button>
      </div>
      <div className="d-flex gap-3">
        {settings.map((setting) => (
          <CardSettings key={setting.ipAddress} setting={setting} />
        ))}
      </div>
      <div>
        {switchResponses.map((response, index) => (
          <div key={index}>{`Switch at ${response.ipAddress}: ${response.response}`}</div>
        ))}
      </div>
    </div>
  );
};

const CardSettings = ({ setting }) => {
  const { ipAddress, location } = setting;
  const [switchState, setSwitchState] = useState(false);
  const [time, setTime] = useState(0);

  const updateSettings = async () => {
    try {
      const response = await axios.post(`http://${ipAddress}/setparams`, {
        switch: switchState ? 1 : 0,
        time,
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="card" style={{ width: '250px', height: '250px', border: '2px solid black', textAlign: 'center', alignItems: 'center', backgroundColor: "#d9d9d9" }}>
      <h4 className="card-title bg-dark text-white p-2 mb-2">Location: {location}</h4>
      <label className="form-label">Switch:</label>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={switchState}
          onChange={() => setSwitchState(!switchState)}
        />
        {switchState && <span className="text-success">✔</span>}
      </div>
      <button
        onClick={updateSettings}
        disabled={!ipAddress}
        className="btn btn-primary mt-2"
      >
        Set
      </button>
    </div>
  );
};

export default Settings;
