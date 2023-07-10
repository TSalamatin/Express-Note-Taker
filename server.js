const express = require('express')
const app = express()
const PORT = 3001
const path = require('path');
const dataBase = require('./db/db.json');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');

//Write Function
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// Read, Add, and write to file
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      //Checking the db
      console.log(parsedData)
      //Writing to db
      writeToFile(file, parsedData);
    }
  });
};

//Read, Delete, and Write to file
const deteleFromFile = (index, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      //Pull the data, find the ID that matches the note sent from the provided code, slice it out
      parsedData.splice(parsedData.findIndex( i => i.name === index , 1));
      //Checking the db
      console.log(parsedData);
      //Put it back in
      writeToFile(file, parsedData);
    }
  })
}

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// GET request for notes
app.get('/api/notes', (req, res) =>
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
);

// POST request to add a note
app.post('/api/notes', (req, res) => {

  // Log that a POST request was received
  console.log(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { id,  title, text} = req.body;

  // If all the required properties are present
  if ( title && text ) {
    // Variable for the object we will save
    const newNote = {
      id: uuid(),
      title,
      text   
    };

    readAndAppend(newNote, './db/db.json');

    res.json(`Note added successfully`);
  } else {

    res.error('Error in adding note');
  }
  
});

// DELETE request for removing npot
app.delete('/api/notes/:id', (req, res) => {
  console.log(`${req.method} request received to delete a note`);


  deteleFromFile(req.params.id, './db/db.json')
  .then(() => {
    res.status(200)
  })
  
});



//HTML Route for notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

//HTML Route for notes.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});




//Always need to listen to the port
app.listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
);
