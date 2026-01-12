import { type Response, type Request } from "express"
import { prisma } from "@repo/db"
export const createQuestion = async (req: Request, res: Response) => {
    try {
        
        let { contestId,title, description, score, options } = req.body
        if (!contestId) {
            res.status(404).json({
                success: false,
                error: 'contestId not provided'
            })
            return;
        }
        let existingContest = await prisma.contest.findFirst({
            where: {
                id: contestId
            }
        })
        if (!existingContest) {
            res.status(409).json({
                success: false,
                error: 'A contest with this contestId does not exist'
            })
            return
        }
        description = description == null ? "" : description;
        const question = await prisma.question.create({
            data: {
                title,
                description,
                score,
                contestId,
                options: {
                    create: options.map((opt: { title: string, isCorrect: boolean }) => ({
                        title: opt.title,
                        isCorrect: opt.isCorrect
                    }))
                }
            },
            include: {
                options: true
            }
        })
        res.status(200).json({
            data:question,
            message:'question created successfully',
            success:true
        })
        return
    } catch (error) {
        console.log('error while creating questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const updateQuestion =async (req: Request, res: Response) => {
    try {
        const questionId=req.params.id
        let {options,...questionFields}=req.body
        console.log('req',req.body)
        if (!questionId) {
            res.status(400).json({
                success: false,
                error: 'questionId not provided'
            })
            return;
        }
        const existingQuestion=await prisma.question.findFirst({
            where:{
                id:questionId
            }
        })
        if(!existingQuestion){
            res.status(404).json({
                error:"Question not found",
                success:false
            })
        }
        const questionData=Object.fromEntries(Object.entries(questionFields).filter((_,value)=>value!==undefined))
        const updatedQuestion=await prisma.$transaction(async(tx)=>{
            const q=await tx.question.update({
                where:{id:questionId},
                data:questionData
            })
            if(Array.isArray(options)){
                await tx.option.deleteMany({
                    where:{
                        questionId
                    }
                })
                let opts=await tx.option.createMany({
                    data:options.map((opt:{title:string,isCorrect:boolean})=>({
                        title:opt.title,
                        isCorrect:opt.isCorrect,
                        questionId
                    }))
                })
            }
            return q;
            
        })
        res.status(200).json({
            success:true,
            data:updatedQuestion,
            message:'question updated successfully'
        })
    
    } catch (error) {
        console.log('error while updating questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const DeleteQuestion = async (req: Request, res: Response) => {
    try {
        const questionId = req.params.id;
        if (!questionId) {
            res.status(404).json({
                success: false,
                error: 'questionId not provided'
            })
            return;
        }
        const existingQuestion = await prisma.question.findUnique({
            where: { id: questionId },
          });
      
          if (!existingQuestion) {
            return res.status(404).json({
              success: false,
              error: "Question not found",
            });
          }
        await prisma.$transaction(async(tx)=>{
            await tx.option.deleteMany({
                where:{
                    questionId
                }
            })
            await tx.question.delete({
                where: {
                    id: questionId
                }
            })
        })
        res.status(200).json({
            success: true,
            message: "Question deleted successfully",
          });

    } catch (error) {
        console.log('error while deleting questions', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const getAllQuestions =async (req: Request, res: Response) => {
    try {
        let questions=await prisma.question.findMany({
            include:{
                options:true
            }
        });
        res.status(200).json({
            success:true,
            data:questions,
            message:'All questions fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching all questions ', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}
export const getQuestionsByContestId = async(req: Request, res: Response) => {
    try {
        let contestId=req.params.id;
        if (!contestId) {
            res.status(404).json({
                success: false,
                error: 'contestId not provided'
            })
            return;
        }
        let questions=await prisma.question.findMany({
            where:{
                contestId
            },
            include:{
                options:true
            }
        })
        res.status(200).json({
            data:questions,
            success:true,
            message:'Questions fetched successfully'
        })
    } catch (error) {
        console.log('error while fetching questions for a contest', error)
        res.status(500).json({
            success: false,
            error,
        })
        return
    }
}