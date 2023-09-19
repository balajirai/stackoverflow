import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ejs from "ejs";

import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/Questions.js";
import answerRoutes from "./routes/Answers.js";
import connectDB from "./connectMongoDb.js";

// import users from "./models/auth.js";

dotenv.config();
connectDB();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// app.use('/',(req, res) => {
//     // res.send("This is a stack overflow by balajirai");
// })

// app.get("/", (req,res)=>{
//   res.send(`<h1 style="text-align:center; margin-top:40px; color:green;">Server Home Page</h1>`)
// })

app.use("/user", userRoutes);
app.use("/questions", questionRoutes);
app.use("/answer", answerRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
