import express, { Router } from 'express'
import { createContest, deleteContest, getAllContest, getContest, getLiveContests, getUpcomingContest, updateContest } from '../controllers/ContestController.js'
export const router:Router=express.Router()


router.post('/',createContest)
router.get('/all',getAllContest)
router.get('/live',getLiveContests)
router.get('/upcoming',getUpcomingContest)
router.patch('/:id',updateContest)
router.delete('/:id',deleteContest)
router.get('/:id',getContest)