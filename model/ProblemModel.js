import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // reference to User model
      ref: "User",
      required: true, // ✅ ensures every problem belongs to a user
    },
    link: {
      type: String,
      required: true,
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
