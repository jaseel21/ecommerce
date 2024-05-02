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
        let productsObj={
            item:productId,
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({userId:uId})
            if(cart){
                let proExist=cart.products.findIndex(product=> product.item==proId)
                console.log(proExist);
                if(proExist!==-1){

                    db.get().collection(collection.CART_COLLECTION).updateOne({"products.item":productId},
                    {
                        $inc:{"products.$.quantity":1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({userId:uId},{
                        $push:{products:productsObj}
                    }).then(()=>{
                        resolve()
                    })
                }

            }else{
                db.get().collection(collection.CART_COLLECTION).insertOne(
                    {
                      userId:uId,
                      products:[
                        productsObj
                      ]
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
                    $unwind:"$products"
                },
                {
                    $project:{
                       item:"$products.item",
                       quantity:"$products.quantity"
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCTS_COLLECTION,
                        localField:"item",
                        foreignField:"_id",
                        as:"product"
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

                
            ]).toArray()
            console.log(cartItems);
            resolve(cartItems)
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
            resolve()
        })
    },
    chacgeProQuantity:(proData)=>{
        count=parseInt(proData.count)

      cartId= new ObjectId(proData.cart)
        proId=new  ObjectId(proData.proId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({"_id":cartId, "products.item":proId},
                    {
                        $inc:{"products.$.quantity":count}
                    }).then(()=>{
                        resolve()
                    })
          
        })

    },

    removeCartProduct: (data) => {
        const cartID = new ObjectId(data.cartId);
        const proID = new ObjectId(data.proId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: cartID },
                { $pull: { products: { item: proID } } }
            ).then((result) => {
                resolve(result); // You can pass data to resolve if needed
            }).catch((error) => {
                reject(error); // Reject if there's an error
            });
        });
    },
    newQuantity: (data) => {
        const cartID = new ObjectId(data.cart);
        const proID = new ObjectId(data.proId);
        return new Promise(async (resolve, reject) => {
            try {
                console.log(cartID, proID);
                const cart = await db.get().collection(collection.CART_COLLECTION).findOne({ _id: cartID });
                if (cart) {
                    console.log(cart);
                    // Find the product within the products array with the provided proID
                    const product = cart.products.find(product => product.item.equals(proID));
                    if (product) {
                        console.log(product);
                        resolve(product.quantity);
                    } else {
                        console.log("Product not found in the cart.");
                        resolve(null); // Resolve with null if the product is not found
                    }
                } else {
                    console.log("No document found with the provided cartID");
                    resolve(null); // Resolve with null if no document is found
                }
            } catch (error) {
                console.error("Error occurred while finding document:", error);
                reject(error); // Reject the promise if an error occurs
            }
        });
    }
    
    
}