// Import React and other dependencies
import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import axios from "axios";
import { Parser } from 'html-to-react';
import { FaSearch, FaTimes,FaSpinner } from 'react-icons/fa'; 
import { motion } from "framer-motion";
import "./App.css";


const path = `https://gitabackend.onrender.com`;

Modal.setAppElement('#root');

const parser = new Parser();

const GitaPage = ({ selectedFont, fontSize, theme }) => {
  const [content, setContent] = useState("");
  const [modalStrings, setModalStrings] = useState(["Hare Krishna", "Jay Shree Ram"]);
  const [heading, explanation] = modalStrings;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleModal = (word) => {
    // Fetch details for the selected word
    axios.get(`${path}/api/words/${word}`)
      .then((response) => {
        setModalStrings([response.data?.word, response.data?.content]);
        openModal();
      })
      .catch((error) => {
        console.error("Error fetching word details:", error);
      });
  };

  useEffect(() => {
    // Fetch search suggestions based on the search text
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`${path}/api/search?searchString=${searchText}`);
        setSearchResults(response.data?.words || []);
         setIsLoading(false);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    // Fetch search results only if search text is provided
    if (searchText.trim() !== "") {
      setIsLoading(true);
      fetchSearchResults();
    } else {
      // Clear search results if search text is empty
      setSearchResults([]);
    }
  }, [searchText]);

  return (
    <div className={`container `}>
      <div className={`search-container ${theme}`}>
        <input
    type="text"
    placeholder="Search"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="search-input"
  />
        {searchText && (
          <button className="close-search" onClick={() => setSearchText("")}>
            <FaTimes />
          </button>
        )}
        <div className={`search-results ${searchResults.length > 0 ? 'show' : ''}`}>
          {searchResults.map((result) => (
            <div key={result.word} className="search-result" onClick={() => handleModal(result.word)}>
              {result.word}
            </div>
          ))}
          {isLoading && <FaSpinner className="loading-spinner" />}
        </div>
      </div>
    
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={{ content: { inset: "10px" } }}
      >
        <div className={`container ${theme}`}>
          <h2 className={`titl`} style={{ fontFamily: selectedFont, fontSize: `${fontSize}px` }}>{heading}</h2>
          <p className="content" style={{ fontFamily: selectedFont, fontSize: `${fontSize/2}px` }}>{parser.parse(explanation)}</p>
          <button className="button" onClick={closeModal}>Close</button>
        </div>
      </Modal>
    </div>
  );
};




//Defining the Navbar Component
const Navbar = ({ changeFont, increaseFont, decreaseFont, handleThemeChange,theme }) => {
  // ...
  
  const [modalIsOpen, setIsOpen] = useState(false);
   

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    
  };

   const handleSearchIconClick = () => {
    
    openModal();
  };


  

  return (
    <div className={`navbar `}>
      {/* Font Selection Dropdown */}
      <div className="dropdown">
        <button className="dropbtn">Font</button>
        <div className="dropdown-content">
          <button onClick={() => changeFont('Poppins')}>Poppins</button>
          <button onClick={() => changeFont('sans-serif')}>Sans-serif</button>
          <button onClick={() => changeFont('serif')}>Serif</button>
          <button onClick={() => changeFont('comic neue')}>Comic Neue</button>
        </div>
      </div>

      {/* Font Size Adjustment Buttons */}
      <button onClick={decreaseFont}>A-</button>
      <button onClick={increaseFont}>A+</button>

      {/* Theme Color Change - Icon/Button */}
      <div className="dropdown">
        <button className="dropbtn">Theme</button>
        <div className="dropdown-content">
          {/* <button onClick={() => handleThemeChange('default')}>Default</button> */}
          <button onClick={() => handleThemeChange('light')}>Light</button>
          <button onClick={() => handleThemeChange('dark')}>Dark</button>
          <button onClick={() => handleThemeChange('yellow')}>Yellow</button>
          <button onClick={() => handleThemeChange('blue')}>Blue</button>
          {/* <button onClick={() => handleThemeChange('wooden')}>Wooden</button> */}
        </div>
      </div>
      {/* Implement the color palette icon/button here */}
      {/* onClick, display theme choices and use changeTheme function */}
      {/* Search Box */}

      {/* <input
        type="text"
        placeholder="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button> */}

      {/* Search Icon */}

      {/* Search Input and Button */}
      
    </div>
  );
};


// Define the main App component
const App = () => {

  // Use a state variable to store the current page

  // Define a function to decrement the page


  //For Navbar
  const [selectedFont, setSelectedFont] = useState("Poppins");

  const changeFont = (font) => {
    setSelectedFont(font);
  };

  const [fontSize, setFontSize] = useState(36);

  const increaseFont = () => {
    setFontSize(fontSize + 1);
  };

  const decreaseFont = () => {
    setFontSize(fontSize - 1);
  };

  const [theme, setTheme] = useState("default");

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const toggleNightMode = () => {
    setTheme(theme === 'night' ? 'default' : 'night');
  };


  // Return the JSX for the component
  return (
      <div className={`noCopy app ${theme}`}>
      <Navbar
        changeFont={changeFont}
        increaseFont={increaseFont}
        decreaseFont={decreaseFont}
        handleThemeChange={handleThemeChange}
        theme={theme}
      />
      <div className="container">
        <div className="heading-container">
          <h1 className="heading">शब्दाक्षर</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <GitaPage
            selectedFont={selectedFont}
            fontSize={fontSize}
            theme ={theme}
            toggleNightMode={toggleNightMode}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Export the App component
export default App;
