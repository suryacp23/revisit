import { Router } from "express";

import {
  addProblem,
  getAllProblems,
  reviewProblem,
  todayProblems,
} from "../controller/problemController.js";

import { protect } from "../middleware/protect.js";

const router = Router();

router.get("/problem", protect, getAllProblems);
router.post("/problem", protect, addProblem);
router.put("/review/:id", protect, reviewProblem);
router.get("/today-reviews", protect, todayProblems);

export default router;
