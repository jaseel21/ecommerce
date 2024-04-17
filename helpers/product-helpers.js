const db=require('../config/connection')
const collection=require('../config/collection')
const {ObjectId}=require('mongodb')

module.exports={

     addProduct:(product,callback)=>{
        db.get().collection("products").insertOne(product).then((data)=>{
    
            console.log(data);
            callback(data.insertedId)
        })
    
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{

            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            const objectId = new ObjectId(proId);
        
            console.log(proId);
            db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({_id:objectId}).then((response)=>{
                console.log(proId);
                console.log(objectId);
                resolve(response)
                

            })
        })
    },
    updateProduct:(proId,Edata)=>{
        const objectId= new ObjectId(proId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:objectId},{
                $set:{
                    Name:Edata.Name,
                    Category:Edata.Category,
                    Price:Edata.Price,
                    Description:Edata.Description
                }})
                
        })
    },
    getProduct:(proId)=>{
        const objectId = new ObjectId(proId);
        console.log(proId);
        console.log(objectId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:objectId}).then((product)=>{
                console.log(product);
                resolve(product)
            })
        })
    },
    addToCart:(proId,userId)=>{
        const uId= new ObjectId(userId)
        const productId=new ObjectId(proId)
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({userId:uId})
            if(cart){
                db.get().collection(collection.CART_COLLECTION).updateOne({userId:uId},
                {
                    $push:{products:productId}
                }).then(()=>{
                    resolve()
                })

            }else{
                db.get().collection(collection.CART_COLLECTION).insertOne(
                    {
                        userId:uId,
                        products:[productId]
                    }
                ).then(()=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(uId)=>{
        return new Promise(async(resolve,reject)=>{

            const objectUID=new ObjectId(uId)
            let cartItems =await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{userId:objectUID}
                },
                {
    
                    $lookup:{
                       from:collection.PRODUCTS_COLLECTION,
                       let:{proList:'$products'},
                       
                       pipeline:[
                           {
                               $match:{
                                   $expr:{
                                       $in:['$_id','$$proList']
                                   }
                               }
                           }
                       ],
                       as:'cartItems'
       
                   }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    },
    cartCount:(uId)=>{
        return new Promise(async(resolve,reject)=>{
            const objectUID=new ObjectId(uId)
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({userId:objectUID});
            if(cart){

                let cartCount=cart.products.length;
               
                resolve(cartCount)
            }
        })
    }
}