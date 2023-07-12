const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const aws = require("aws-sdk");
var image_location="";
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "HAPPYBIRTHDAY9661715024",
    database: "mydatabase"
  });
  
  db.connect((err)=>{
    if(!err){
        console.log("Connected");
    }else{
        console.log("Connection Failed");
        console.log(err);
    }
  })

const login = async (req, res) => {
  const { mobile_no, password } = req.body;
  console.log(mobile_no);
  db.query(`SELECT * FROM equip9_usersdata_table WHERE mobile_number = "${mobile_no}"`, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      if (result) {
        const isValidPassword = bcrypt.compareSync(password,result[0].password);
        // console.log("LOG2", isValidPassword);
        if (isValidPassword) {
          // log him in
          const jwtSignaturePayload = {
            mobile_no: result[0].mobile_number,
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            profile_pic: result[0].profile_picture,
            admin: result[0].admin,
          };
    
          // generate a JWT token
          const authToken = jwt.sign(jwtSignaturePayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
    
          const response = {
            ...jwtSignaturePayload,
            authToken,
          };
          res.send(response);
        } else {
          res.status(401).send("Incorrect password");
        }
      } else {
        res.status(404).send({
          status: "Failed",
          reason: "Incorrect credentials or the user doesn't exist",
        });
      }
    }
  });

}

const logout = async (req, res) => {
  // res.clearCookie("COOKIETOKEN");
  // res.send({ success: true });
};

const signup =  (req, res) => {
    console.log(req.body);
    let uploadFile = req.files.file;
    console.log(req.files);
    console.log(uploadFile);
    const filename = uploadFile.name;
    const fileContent = uploadFile.data;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${filename}`,
      Body: fileContent
    }

    // s3.upload(params, (err, data) => {
    //   console.log(data);
    //   image_location = data.Location;
    // })
    // console.log(image_location);
    // const { first_name,last_name,mobile_no, password } = req.body;
    // const hashedPassword = bcrypt.hashSync(password, 10);
    // const id = uuidv4();
    // db.query(`INSERT INTO equip9_usersdata_table VALUES ("${id}","${first_name}","${last_name}","${mobile_no}","${hashedPassword}","${image_location}",NOW(),"${first_name+" "+last_name}",NOW(),"${first_name+" "+last_name}")`,(err,result)=>{
    //     if(err){
    //         console.log(err);
    //     }else {
    //         res.send("values inserted");
    //     }
    // });
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
  
      console.log(data);
      const image_location = data.Location;
  
      const { first_name, last_name, mobile_no, password, admin } = req.body;
      const isAdmin = admin === 'true' ? 1 : 0;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const id = uuidv4();
  
      db.query(`INSERT INTO equip9_usersdata_table VALUES ("${id}","${first_name}","${last_name}","${mobile_no}","${hashedPassword}","${image_location}",${isAdmin},NOW(),"${first_name + " " + last_name}",NOW(),"${first_name + " " + last_name}")`, (err, result) => {
        if (err) {
          console.log(err);
          // Handle the error accordingly
          res.status(500).send("Failed to insert values");
        } else {
          res.send("Values inserted successfully");
        }
      });
    });

};

const read =  (req, res) => {
  db.query(`SELECT * FROM equip9_usersdata_table`, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.send(result);
    }
  });
};
const update = (req, res) => {
  const { mobile_no, ...editData } = req.body;

  db.query(
    `UPDATE equip9_usersdata_table SET first_name = ?, last_name = ? WHERE mobile_number = ?`,
    [editData.first_name, editData.last_name, mobile_no],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to update user");
      } else {
        res.send("User updated successfully");
      }
    }
  );
};


const Delete =  (req, res) => {
  const { mobile_no } = req.body;
  db.query(`DELETE FROM equip9_usersdata_table WHERE mobile_number = "${mobile_no}"`, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.send(result);
    }
  });
};

const generateToken=(_id)=>{
  return jwt.sign({_id},process.env.JWT_SECRET,{
    expiresIn:'24h'
  })
}

module.exports = { login, signup, logout, read, update, Delete};
