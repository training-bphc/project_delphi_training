import React, { useState } from "react";
import "./createNewRecords.css";

function CreateNewRecord() {
  const [studentId, setStudentId] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Search");

  // Placeholder for backend check
  // In the future, replace this with an API call to check if BITS ID exists
  const handleSearch = () => {
    // This is for sample purpode, like once we have backend and proper API integration,
    // we can replace this logic with actual API response from the data base
    if (
      studentId === "20240546" ||
      studentId === "20230046" ||
      studentId === "20231100" ||
      studentId === "20231106"
    ) {
      setButtonLabel("Modify");
    } else if (studentId) {
      setButtonLabel("Add new");
    } else {
      setButtonLabel("Search");
    }
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
