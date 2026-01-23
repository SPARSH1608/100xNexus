import express, { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
const router = express.Router()
import { prisma } from '@repo/db'
import jwt from 'jsonwebtoken'
export const signupUser = async (req: Request, res: Response) => {
    try {
        let { name, email, password, role } = req.body;
        const isRegistered = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (isRegistered) {
            res.status(409).json({
                success: false,
                error: "Email already exists"
            })
            return
        }
        role = role ? role : "CANDIDATE"
        const hashedPassword = bcrypt.hashSync(password, Number(process.env.SALT!));
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashedPassword,
            }
        })

        const token = jwt.sign({ userId: user!.id }, process.env.SECRET!, { expiresIn: '1d' })
        res.status(200).json({
            success: true,
            data: {
                token,
                role
            },
            message: 'User created successfully'
        })
        return
    } catch (error) {
        console.log('error in creating user', error)
        res.status(500).json({
            success: false,
            error: error
        })
        return

    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        let user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User with this email does not exist'
            })
            return
        }
        const isValid = bcrypt.compareSync(password, user!.password)
        if (!isValid) {
            res.status(401).json({
                success: false,
                error: 'Wrong credentials'
            })
            return
        }
        const token = jwt.sign({ userId: user!.id }, process.env.SECRET!, { expiresIn: '1d' })
        res.status(200).json({
            success: true,
            data: {
                token,
                role: user!.role
            },
            message: 'User logged in successfully'
        })
    } catch (error) {
        console.log('error in login user', error)
        res.status(500).json({
            success: false,
            error
        })
        return;
    }
}

export const updateRole = (req: Request, res: Response) => {

}
//409 email already exist
//401 wrong credentials