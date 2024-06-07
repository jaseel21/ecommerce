const db=require('../config/connection')
const collection=require('../config/collection')
const {ObjectId}=require('mongodb')

module.exports={
    getPlacedOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let palcedPro= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:'placed'}
                }
            ]).toArray()
            resolve(palcedPro)
        })
    },
    statusChangeToship:(orderId)=>{
        return new Promise((resolve,reject)=>{
            const Obid=new ObjectId(orderId)

            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:Obid},{
                $set:{
                    status:"shipped"
                }
            }).then(()=>{
                resolve()
            })

        })
    },

    getShippedOrders:()=>{
       
            return new Promise(async(resolve,reject)=>{
                let shippedOrd= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{status:'shipped'}
                    }
                ]).toArray()
                resolve(shippedOrd)
            })
       
    }
    
       
}