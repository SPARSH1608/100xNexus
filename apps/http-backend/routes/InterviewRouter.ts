import express from "express";
import { AdminMiddleware, authMiddleware } from "../middleware/AuthMiddleware.js";
import {
    createInterview,
    getAllInterviews,
    getInterviewById,
    getStudentInterviews,
    updateInterview,
    getMyInterviews
} from "../controllers/InterviewController.js";

export const router: any = express.Router();

router.post("/", AdminMiddleware, createInterview);

router.patch("/:id", AdminMiddleware, updateInterview);

router.get("/all", AdminMiddleware, getAllInterviews);

router.get("/my-interviews", authMiddleware, getMyInterviews);

router.get("/:id", authMiddleware, getInterviewById);

router.get("/student/:studentId", authMiddleware, getStudentInterviews);
