const express = require("express");
const PORT = process.env.PORT || 9000;
const users = require("./routes/usersRoute");
const dotenv = require("dotenv").config();
const cors = require("cors");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
const fileUpload = require("express-fileupload");
app.use(
    fileUpload({
      useTempFiles: true,
      safeFileNames: true,
      preserveExtension: true,
      tempFileDir: `${__dirname}/public/files/temp`
    })
  );

app.use("/users", users);

app.listen(9000, () => {
  console.log(`Server started on port 9000`);
});
