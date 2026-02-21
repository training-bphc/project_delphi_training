import React, { useState } from "react";
import "./createNewRecords.css";

function CreateNewRecord() {
  const [studentId, setStudentId] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Search");

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setButtonLabel("Search");
      return;
    }

    const response = await fetch(
      `/api/records/by-bits-id/${encodeURIComponent(studentId.trim())}`,
    );

    if (response.ok) {
      setButtonLabel("Modify");
      return;
    }

    if (response.status === 404) {
      setButtonLabel("Add new");
      return;
    }

    setButtonLabel("Search");
  };

  // Reset button label when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
    setButtonLabel("Search");
  };

  return (
    <div className="createNewRecordContainer">
      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={handleInputChange}
        className="createNewRecordInput"
      />
      <button className="createNewRecordButton" onClick={handleSearch}>
        {buttonLabel}
      </button>
    </div>
  );
}

export default CreateNewRecord;
