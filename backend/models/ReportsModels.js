import { Schema, model } from "mongoose";

// ReportCategory Schema
const reportCategorySchema = new Schema(
  {
    title: { type: String, required: [true, "Category title is required"] },
    description: { type: String },
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ReportCategory = model("ReportCategory", reportCategorySchema);

// Region Schema
const regionSchema = new Schema({
  title: { type: String, required: [true, "Category title is required"] },
  rss: { type: String },
  supervisor: { type: String },
  reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
  stations: [{ type: Schema.Types.ObjectId, ref: "Station" }],
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

const Region = model("Region", regionSchema);

// Station Schema
const stationSchema = new Schema(
  {
    name: { type: String, required: true },
    region: { type: Schema.Types.ObjectId, ref: "Region", required: true },
    managerName: { type: String, required: true },
    managerPhone: { type: String, required: true },
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
  },
  { timestamps: true }
);

const Station = model("Station", stationSchema);

// Report Schema
const reportSchema = new Schema(
  {
    title: { type: String, required: true },
    region: { type: Schema.Types.ObjectId, ref: "Region", required: true },
    reportCategory: {
      type: Schema.Types.ObjectId,
      ref: "ReportCategory",
      required: true,
    },
    description: { type: String },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    station: [{ type: Schema.Types.ObjectId, ref: "Station", required: true }],
    comment: { type: String },
    pump: { type: String },
  },

  { timestamps: true }
);

const Report = model("Report", reportSchema);

export { ReportCategory, Region, Station, Report };
