import Problem from "../model/ProblemModel.js";

/**
 * Add a new problem for the logged-in user
 */
export const addProblem = async (req, res) => {
  try {
    const userId = req.user._id; // 👈 user injected by middleware
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ message: "Link is required" });
    }

    // Check if user already added the problem
    const existing = await Problem.findOne({ userId, link });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Problem already exists for this user" });
    }

    const problem = new Problem({ userId, link });
    await problem.save();

    res.status(201).json(problem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Problem already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to add problem" });
  }
};

/**
 * Get all problems for logged-in user
 */
export const getAllProblems = async (req, res) => {
  try {
    const userId = req.user._id;
    const problems = await Problem.find({ userId }).sort({
      lastCompletedDate: -1,
      createdAt: -1,
    });

    res.status(200).json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching problems" });
  }
};

/**
 * Review a problem and update its next review date
 */
export const reviewProblem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const problem = await Problem.findOne({ _id: id, userId }); // 👈 scoped to user
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const today = new Date();
    problem.lastCompletedDate = today;
    problem.successfullReview += 1;

    // Calculate next review date dynamically
    let daysToAdd = 7;
    if (problem.successfullReview === 3 || problem.successfullReview === 4) {
      daysToAdd = 10;
    } else if (problem.successfullReview >= 5) {
      daysToAdd = 15;
    }

    problem.nextReviewDate = new Date(
      today.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

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

/**
 * Get all problems due for review today (for logged-in user)
 */
export const todayProblems = async (req, res) => {
  try {
    const userId = req.user._id;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // ✅ Include both today’s and overdue problems
    const problems = await Problem.find({
      userId,
      nextReviewDate: { $lte: end }, // anything due before or on today
    });

    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
