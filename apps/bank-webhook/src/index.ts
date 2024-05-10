import express from "express";
import db from "@repo/db/client"

const app = express();

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    // Update balance in db, add txn
    try{
        await db.$transaction([
            db.balance.updateMany({
                where:{
                    userId:Number(paymentInformation.userId)
                },
                data:{
                    amount:{
                        increment:Number(paymentInformation.amount)
                    }
                }
            })
        ]);
        db.onRampTransaction.updateMany({
            where:{
                token:paymentInformation.token
            },
            data:{
                status:"Success",
            }
        });

        res.json(200).json({
            message:"captured"
        })
    }
    catch(e){
        console.error(e);
        res.status(411).json({
            message:"Error while processing webhook"
        })
        
    }
})

app.listen(3003)