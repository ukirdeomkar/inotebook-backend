const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const Notes = require("../modules/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1 : create a post request to /api/notes/addnote for adding a note by a user . Login Required for this.
router.post(
  // route
  "/addnote",
  //   connect to middleware to get user id in the request from the authToken
  fetchUser,
  //   added validation for the notes
  [
    body("title", "The Title should be atleast 3 characters").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description should be atleast 5 characters long "
    ).isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // check if some error exists
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // wrap in try-catch to avoid app-crashing
    try {
      // get user id and is made possible bcoz of fetchuser middleware
      const user = req.user.id;
      //   use destructing to get data from req.body object
      let { title, description, tag } = req.body;
      // use Note module to create new note
      const note = new Notes({
        user,
        title,
        description,
        tag,
      });
      //   save the note to db
      const savedNote = await note.save();
      //   return saved note as response
      return res.json(savedNote);
    } catch (error) {
      // Catches Error and prevents app from crashing
      return res.status(500).send(`Internal Server Error ${error}`);
    }
  }
);

// ROUTE 2 : create a get request to /api/notes/fetchnotes for fetching all notes of a user . Login Required for this.
router.get(
  // route
  "/fetchnotes",
  //   connect to middleware to get user id in the request from the authToken
  fetchUser,
  async (req, res) => {
    // wrap in try-catch to avoid app-crashing
    try {
      // get user id and is made possible bcoz of fetchuser middleware
      const userID = req.user.id;
      // find note for that particular user-id
      const notes = await Notes.find({ user: req.user.id });
      //   return all notes of that user-id
      return res.json(notes);
    } catch (error) {
      // Catches Error and prevents app from crashing
      return res.status(500).send(`Internal Server Error ${error}`);
    }
  }
);

module.exports = router;
