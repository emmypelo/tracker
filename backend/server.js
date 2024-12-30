import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { localStrategy, jwtStrategy } from "./utilities/passportConfig.js"; //strategies
import cookieParser from "cookie-parser";
import taskRouter from "./routers/taskRouter.js";
import userRouter from "./routers/userRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import subCategoryRouter from "./routers/subCategoryRouter.js";
import regionRouter from "./routers/regionRouter.js";
import reportCategoryRouter from "./routers/reportCategoryRouter.js";
import stationRouter from "./routers/stationRouter.js";
import reportRouter from "./routers/reportRouter.js";

// create Express instance in app
const app = express();

const port = process.env.PORT;

app.use(express.json());
// cors configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://10.0.110.139:4000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(cookieParser());
localStrategy();
jwtStrategy();
// Routes
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sub_category", subCategoryRouter);
app.use("/api/regions", regionRouter);
app.use("/api/reportcategory", reportCategoryRouter);
app.use("/api/stations", stationRouter);
app.use("/api/reports", reportRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on the server" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const message = err.message;
  const stack = err.stack;
  res.status(500).json({ message, stack });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("Connected to MongoDB & listening on port", port);
    });
  })
  .catch((error) => {
    console.log(error);
  });
