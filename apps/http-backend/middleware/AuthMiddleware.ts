import { prisma } from "@repo/db";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        
        interface Request {
            userId:string,
            role:string
        }
    }
}
export const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { authorization } = req.headers;
        if(!authorization){
            res.status(400).json({
                success:false,
                error:'Required headers not found'
            })
            return
        }
        const token = authorization.split(' ')[1];
        if(!token){
            res.status(400).json({
                success:false,
                error:'No token found'
            })
            return
        }
        console.log('token',token)
        let decoded=jwt.verify(token,process.env.SECRET!) as JwtPayload
        if(!decoded){
            res.status(403).json({
                success:false,
                error:'Not authorized'
            })
            return;
        }
        req.userId=decoded.userId
        next()
        
        
    } catch (error) {
        console.log('error in auth middleware',error)
        res.status(500).json({
            success:false,
            error
        })
    }
}

export const AdminMiddleware=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.userId;
        let user=await prisma.user.findFirst({
            where:{
                id:userId
            },
            select:{
                role:true
            }
        }) 
        console.log('user',user)
        if(!user || user.role!=='ADMIN'){
            res.status(403).json({
                success:false,
                error:'Unauthorized Access'
            })
            return
        }
        req.role=user.role
        next()
    } catch (error) {
        console.log('error in role middleware',error)
        res.status(500).json({
            success:false,
            error
        })
        return
    }
}