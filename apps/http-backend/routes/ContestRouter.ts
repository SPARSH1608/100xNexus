import express, { Router } from 'express'
import { changeContestStatus, createContest, deleteContest, getAllContest, getContest, getLiveContests, getUpcomingContest, updateContest, getMyContests, joinContest, streamContest, submitAnswer, getLeaderboard, getAllSubmissions } from '../controllers/ContestController.js'
export const router: Router = express.Router()


router.post('/', createContest)
router.get('/submissions/all', getAllSubmissions)
router.get('/all', getAllContest)
router.get('/live', getLiveContests)
router.get('/upcoming', getUpcomingContest)
router.get('/my-contests', getMyContests)
router.patch('/:id', updateContest)
router.delete('/:id', deleteContest)
router.get('/:id', getContest)
router.post('/:id/status', changeContestStatus)
router.post('/:id/join', joinContest)
router.get('/:id/stream', streamContest)
router.post('/:id/submit', submitAnswer)

router.get('/:id/leaderboard', getLeaderboard)