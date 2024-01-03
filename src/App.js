// Import React and other dependencies
import React, { useState, useEffect } from "react";
import ContentEditable from 'react-contenteditable';
import Modal from 'react-modal';
import axios from "axios";
import { Parser } from 'html-to-react';
import { FaSearch } from 'react-icons/fa'; 
import "./App.css";

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

const parser = new Parser();

// Define a custom component for each page of the Gita
const GitaPage = ({ page, setPage, selectedFont, fontSize, theme, toggleNightMode}) => {
  // Use state variables to store the content and the night mode status
  const [content, setContent] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const [bookName,setBookName] = useState("Ancient Texts");

   const [modalStrings, setModalStrings] = useState(["Hare Krishna", "Jay Shree Ram"]);
  const [heading, explanation] = modalStrings;

  // below code is for modal
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }
  //above code ends for modal


   const handleModal = (evt) => {
    // Get the new page number from the event target value
    const heading = evt.target.textContent;
    const explanation = evt.target.dataset.string;
    setModalStrings([heading,explanation]);
    openModal();
  };


  // Define a function that takes a string as an argument and returns the modified string
function changeString(str) {
  // Define a regular expression that matches the pattern and captures the two strings as groups
  let regex = /{([^}]*)} \[([^\]]*)\]/g;

  // Use the replace() method with a callback function that returns a span element
  let newStr = str.replace(regex, (match, p1, p2) => {
    // Return a span element with the second string as the data-string attribute and the first string as the text content
    // return `<span data-string="${p2}" class="color">${p1}</span>`;
    return `<li data-string="${p2}" value="${p1}" class="color">${p1}</li>`;
  });

  // Return the modified string
  return newStr;
}


  // Use an effect hook to fetch the content from the API when the page changes
  useEffect(() => {
    // Define the API URL based on the page number
    const url = `https://gitabackend.onrender.com/api/pages/${page}`;
    //console.log("request sent");

    // Use axios to make a GET request and set the content state
    axios
      .get(url)
      .then((response) => {
        // Extract the verses from the response data
        let verses = changeString(response.data?.content);
        // console.log(verses);
        // Set the content state
        const regex = /heading\(([^)]+)\)(.*)/;
        const matches =  verses.match(regex);
        
        verses = matches[2];
        //console.log(verses);
        // Join the verses with line breaks and set the content state
        const text = verses.split("__").join("<br><br>");
        //console.log(text);
        setContent(text);
       
        // loop through the collection
        setTimeout(() => {
           document.querySelectorAll("li").forEach(function(span) {
          // add a click event listener to each element
          //console.log(span);
          span.addEventListener("click", handleModal);
        });
        }, 500);
        
        setBookName(matches[1]);
       
      })
      .catch((error) => {
        // Handle the error and set the content state to an error message
        // console.error(error);
        setContent("Something went wrong. Please try again later.");
        setBookName("Ancient Texts")
        // setContent(error);

      });

      return ()=>{
        // loop through the collection
        document.querySelectorAll("li").forEach(function(span) {
          // add a click event listener to each element
          //console.log("removing listener",span);
          span.removeEventListener("click", handleModal);
        });

      };
  }, [page]); // Only run the effect when the page changes

  // Define a function to toggle the night mode
  // const toggleNightMode = () => {
  //   setNightMode(!nightMode);
  // };

  // Define a function to handle the page change
  const handlePageChange = (evt) => {
    // Get the new page number from the event target value
    const str = evt.target.textContent;
    const newPage = parseInt(str.substring(str.lastIndexOf(" ")))

    // setBookName("Ancient Texts")
    //console.log(str.substring(str.lastIndexOf(" ")));
    //Check if the new page is a valid number and within the range of 1 to 18
    if (!isNaN(newPage) && newPage >= 1 ) {
      // Set the page state to the new page number
      setPage(newPage);
    }
  };

  

  // Return the JSX for the component
  return (
     <div className={`container `}>
      <ContentEditable
        className="titl"
        html={`Book ${page}`} 
        disabled={false} 
        onBlur={handlePageChange} 
        tagName="h1" 
        style={{ fontFamily: selectedFont, fontSize: `${fontSize-20}px` , textAlign:"left", margin: "-30px 0 1px 0"}} // Apply selected font and font size
      />
      <h3 className="titl" style={{ fontFamily: selectedFont,textAlign:"left",fontSize: `${fontSize-18}px`, marginBottom:"2px"}}>{bookName}</h3>
      
        <ol className="content" style={{ fontFamily: selectedFont, fontSize: `${fontSize/2}px` }}>
        {parser.parse(content)}
        </ol>
      
      {/* <button className="button" onClick={toggleNightMode}>
        {nightMode ? "Light Mode" : "Night Mode"}
      </button> */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={{
                  content: {
                    inset: "10px",
                  },
               }}
      >
      <div className={`container ${theme}`}>
        <h2 className={`titl ${nightMode ? "night" : ""}`} style={{ fontFamily: selectedFont, fontSize: `${fontSize}px` }} >{heading}</h2>
        <p className="content" style={{ fontFamily: selectedFont, fontSize: `${fontSize/2}px` }} >{parser.parse(explanation)}</p>
        <button className="button" onClick={closeModal}>Close</button>
      </div>
      </Modal>
    </div>
  );
};

//Defining the Navbar Component
const Navbar = ({ changeFont, increaseFont, decreaseFont, handleThemeChange,setPage,theme }) => {
  // ...
   const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
   const [showSearchInput, setShowSearchInput] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setShowSearchInput(false);
  };

   const handleSearchIconClick = () => {
    setShowSearchInput((prev) => !prev); // Toggle search input and button visibility
    openModal();
  };

  const handleSearch = async () => {
    try {
      //console.log(searchText);
      const response = await axios.get(`https://gitabackend.onrender.com/api/search?searchString=${searchText}`);
      setSearchResults(response.data?.pages);
      //openModal();
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
    closeModal();
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
          <button onClick={() => handleThemeChange('wooden')}>Wooden</button>
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
      <button onClick={handleSearchIconClick}>
         <FaSearch />
      </button>

      {/* Search Input and Button */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Search Results"
      >
        {showSearchInput && (
          <div className="search-modal">
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-submit">
              Search
            </button>
          </div>
        )}

        {/* Display Search Results */}
        <div className="search-results">
          <h2>Search Results</h2>
          {searchResults.map((page) =>{ 
            console.log(page);
            const pageNo = page?.page;
            const regex = /heading\(([^)]+)\)(.*)/;
            const matches =   page?.content?.match(regex);
            const bookName = matches[1];
            return (
            <button key={pageNo} onClick={() => handlePageClick(pageNo)} className="search-results-button">
               {bookName}
            </button>
          )
          }
          )}
        </div>
        <button onClick={closeModal} className="button">
          Close
        </button>
      </Modal>
    </div>
  );
};


// Define the main App component
const App = () => {

  // Use a state variable to store the current page
  const [page, setPage] = useState(1);

  // Define a function to increment the page
  const nextPage = () => {
      // Increment the page by 1
      setPage(page + 1);
   
  };

  // Define a function to decrement the page
  const prevPage = () => {
    // Check if the page is within the range of 1 to 18
    if (page > 1) {
      // Decrement the page by 1
      setPage(page - 1);
    } else {
      // Set the page to 18
      setPage(1);
    }
  };

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
        setPage={setPage}
        theme={theme}
      />
      <div className="container">
        <GitaPage
          page={page}
          setPage={setPage}
          selectedFont={selectedFont}
          fontSize={fontSize}
          theme={theme}
          toggleNightMode={toggleNightMode}
        />
        <div className="navigation">
          <button className="button" onClick={prevPage}>
            Previous
          </button>
          <button className="button" onClick={nextPage}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the App component
export default App;
