import express, { Router } from 'express'
import { getAllUsers, updateUserBatches } from '../controllers/UserController.js'

export const router: Router = express.Router()

router.get('/', getAllUsers)
router.patch('/:id/batches', updateUserBatches)
