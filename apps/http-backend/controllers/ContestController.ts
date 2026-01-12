import { type Response, type Request } from "express"
import { prisma } from "@repo/db"
declare global {
    namespace Express {
        interface Request {
            userId: string
        }
    }
}
export const createContest = async (req: Request, res: Response) => {
    try {
        let { title, isOpenAll, startTime, duration  } = req.body;
        const userId = req.userId

        const existingContest = await prisma.contest.findFirst({
            where: {
                title
            }
        })
        if (existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest already exists with this title'
            })
        }
        const contest = await prisma.contest.create({
            data: {
                title,
                userId,
                isOpenAll,
                startTime,
                duration,
                status:'DRAFT'

            }
        })
        res.status(200).json({
            success:true,
            data:contest,
            message:'Contest created successfully'
        })
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const updateContest = async(req: Request, res: Response) => {
    try {
        const contestId=req.params.id;
        
        let existingContest=await prisma.contest.findFirst({
            where:{
                id:contestId
            }
        })
        if(!existingContest){
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
        }
        let updateData=Object.fromEntries(Object.entries(req.body).filter((_,value)=>value!=undefined))
        console.log('data to update',updateData)
        const contest=await prisma.contest.update({
            where:{
                id:contestId
            },data:updateData
        })
        res.status(200).json({
            success:true,
            data:updateData,
            message:'Contest updated successfully'
        })
        return
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const deleteContest = async(req: Request, res: Response) => {
    try {
        let contestId=req.params.id
        await prisma.contest.delete({
            where:{id:contestId},
          
        })
        res.status(200).json({
            success:true,
            data:{},
            message:'Contest deleted successfully'
        })
        return

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

export const getContest = async(req: Request, res: Response) => {
    try {
        const contestId=req.params.id;
        const existingContest = await prisma.contest.findFirst({
            where: {
                id:contestId
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest does not  exists with this contestId'
            })
        }
        res.status(200).json({
            success:true,
            data:existingContest,
            message:'Contest fetched successfully'
        })
       return
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
        return
    }
}
export const getAllContest = async(req: Request, res: Response) => {
    try {
        let contests=await prisma.contest.findMany({}) || []
        res.status(200).json({
            success:true,
            data:contests,
            message:'Contests fetched successfully'
        })
        
    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const getLiveContests = async(req: Request, res: Response) => {
    try {
        let contest=await prisma.contest.findMany({
            where:{
                status:'LIVE'
            }
        })

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}
export const getUpcomingContest=async(req:Request,res:Response)=>{
    try {
        const currentTime=Date.now().toLocaleString()
        console.log('currentTime',currentTime)
        let contest=await prisma.contest.findMany({
            where:{
                OR:[
                    {
                        status:'LIVE'
                    },
                    {
                        status:'PUBLISHED'
                    }
                ],
               AND:[
                    {
                        startTime:{
                            gte:currentTime 
                        }
                    }
                    
               ]
            }
        })
        res.status(200).json({
            success:true,
            data:contest,
            message:'Upcoming contests fetched successfully'
        })

    } catch (error) {
        console.log('error while creating contest', error)
        res.status(500).json({
            success: false,
            error: error
        })
    }
}