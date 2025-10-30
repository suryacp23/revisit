import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      unique: true, // 👈 makes it unique at DB level
      trim: true,
    },
    lastCompletedDate: {
      type: Date,
      default: Date.now,
    },
    nextReviewDate: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      },
    },
    successfullReview: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
