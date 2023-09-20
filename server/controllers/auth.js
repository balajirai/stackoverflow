import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import users from "../models/auth.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (existinguser) {
      return res.status(404).json({ message: "User already Exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json("Something went worng...");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (!existinguser) {
      console.log("User don't Exist.");
      return res.status(404).json({ message: "User don't Exist." });
    }
    const isPasswordCrt = await bcrypt.compare(password, existinguser.password);
    if (!isPasswordCrt) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: existinguser, token });
  } catch (error) {
    res.status(500).json("Something went worng...");
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  // console.log(users);
  try {
    const user = await users.findOne({ email: email });

    if (user) {
      // creating one-time link valid for 15 min
      console.log(user)
      const secret = process.env.JWT_SECRET + user.password;
      const payload = {
        id: user._id,
        email: user.email
      }
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });

      // backend protocol and domain
      const protocol = req.protocol;
      const host = req.get("host");

      // const resetLink = `http://localhost:5000/user/forgot-password/${user._id}/${token}`;
      const resetLink = `${protocol}://${host}/user/forgot-password/${user._id}/${token}`;
      console.log("Link : ", resetLink);

      // sending mail using nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MY_MAIL,
          pass: process.env.MAIL_PASS,
        },
      });

      await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log("Server is ready to take our messages");
            resolve(success);
          }
        });
      });

      const mailOptions = {
        from: process.env.MY_MAIL,
        to: email, // Replace with the recipient's email
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
      };

      await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Email not sent:', error);
            // Handle the error
            reject(error);
            res.status(200).json({ message: 'Email not sent' });
          } else {
            console.log('Email sent:', info.response);
            resolve(info);
            // Inform the user that an email has been sent
            res.status(200).json({ message: 'User exists' });
          }
        });
      });
      // res.status(200).json({ message: 'User exists' });
    }
    else {
      res.status(200).json({ message: 'User not found' });
    }
  } catch (error) {
    // Handle database errors or other errors
    res.status(500).json({ message: 'Server error' });
  }
};

export const getResetPassword = async (req, res) => {
  const { id, token } = req.params;
  // res.send(req.params);
  try {
    const user = await users.findById({ _id: id });
    if (!user) {
      res.send("Invalid Id...");
      return;
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    res.render("passwordReset", { email: user.email });

  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

export const postResetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // res.send(req.params);
  try {
    const user = await users.findById({ _id: id });
    if (!user) {
      res.send("Invalid Id...");
      return;
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    // hashing password before updating
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    const updatedUser = await users.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (updatedUser) {
      res.send(`<h1 style="text-align:center; margin-top:40px; color:green;">Your password has been reset</h1>`);
    }
    else {
      res.send(`<h1 style="text-align:center; margin-top:40px; color:red;">An Error occured. Please try again.</h1>`);
    }
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
}