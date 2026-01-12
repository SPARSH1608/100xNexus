import express, { Router } from 'express'
import { createQuestion, DeleteQuestion, getAllQuestions, getQuestionsByContestId, updateQuestion } from '../controllers/QuestionController.js'
export const router:Router=express.Router()


router.post('/',createQuestion)
router.patch('/:id',updateQuestion)
router.delete('/:id',DeleteQuestion)
router.get('/',getAllQuestions)
router.get('/:id',getQuestionsByContestId)