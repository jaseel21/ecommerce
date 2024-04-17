const db=require('../config/connection')
const collection=require('../config/collection')
const bcrypt=require('bcrypt')



module.exports={
    doSignup:async(user,callback)=>{
        user.password=await bcrypt.hash(user.password,10)
        const result =await db.get().collection(collection.USER_COLLECTION).insertOne(user)

        callback(result)
    },

    doLogin:(user)=>{
        return new Promise((resolve,reject)=>{
            let response={}
            db.get().collection(collection.USER_COLLECTION).findOne({email:user.email}).then((data)=>{
              
                if(data){
                    bcrypt.compare(user.password,data.password).then((status)=>{
                        
                        if(status){
                            response.status=true
                            response.user=data
                            resolve(response)
                        }else{
                           
                            resolve({status:false})
                        }
                    })
                }else{
                    
                    resolve({status:false})
                }
            })
           
        })
    }
}