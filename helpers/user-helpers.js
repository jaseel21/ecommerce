const db=require('../config/connection')
const collection=require('../config/collection')
const bcrypt=require('bcrypt')



module.exports={
    doSignup:(user)=>{
        console.log(user);
        

        return new Promise(async(resolve,reject)=>{
            user.Password=await bcrypt.hash(user.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{


               resolve(user)
            })
    
        })
    },
   

    doLogin:(user)=>{
        return new Promise((resolve,reject)=>{
            let response={}
            db.get().collection(collection.USER_COLLECTION).findOne({Email:user.Email}).then((data)=>{
              
                if(data){
                    bcrypt.compare(user.Password,data.Password).then((status)=>{
                        
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