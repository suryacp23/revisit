// router.get("/all-problems");
// router.post("/problem");
// router.put("/:id/review");
// router.get("/today-reviews");

import Problem from "../model/ProblemModel.js";

export const addProblem = async (req, res) => {
  try {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ message: "Link is required" });
    }

    // Optional: check manually before insert (faster fail)
    const existing = await Problem.findOne({ link });
    if (existing) {
      return res.status(409).json({ message: "Problem already exists" });
    }

    const problem = new Problem({ link });
    await problem.save();

    res.status(201).json(problem);
  } catch (error) {
    // Handle duplicate key errors (just in case)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Problem already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to add problem" });
  }
};
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({
      lastCompletedDate: -1,
      createdAt: -1,
    });

    res.status(200).json(problems);
  } catch (error) {
    console.log(error);
  }
};
export const reviewProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the problem
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Update fields
    const today = new Date();
    problem.lastCompletedDate = today;
    problem.successfullReview += 1;

    // Calculate next review days
    let daysToAdd = 7;
    if (problem.successfullReview === 3 || problem.successfullReview === 4) {
      daysToAdd = 10;
    } else if (problem.successfullReview >= 5) {
      daysToAdd = 15;
    }

    problem.nextReviewDate = new Date(
      today.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    // Save updated document
    await problem.save();

    res.json({
      message: "Review updated successfully",
      updatedProblem: problem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating problem review" });
  }
};
export const todayProblems = async (req, res) => {
  try {
    const start = new Date();
    // midnight (start of today)
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    // end of today
    end.setHours(23, 59, 59, 999);

    const problems = await Problem.find({
      nextReviewDate: { $gte: start, $lte: end },
    });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
