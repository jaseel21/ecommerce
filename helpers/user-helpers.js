const db=require('../config/connection')
const collection=require('../config/collection')
const bcrypt=require('bcrypt')
const Razorpay=require('razorpay')

  var instance = new Razorpay({ key_id: 'rzp_test_HTLtd98iebJmUj', key_secret: 'XfsmUH3gxM0wW18e6pWv0IP8' })


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
    },
    razorpayOrderCreate:(orderID,total)=>{
        return new Promise((resolve,reject)=>{

            var options={
                amount:total,
                currency:"INR",
                receipt:orderID
            };
            instance.orders.create(options, function(err ,order){
               console.log(order);
                resolve(order)
            })

            
        })

        

    },
    verifyPayment:(details)=>{
        const crypto = require('crypto');
        return new Promise((resolve, reject) => {
            const hmac = crypto.createHmac('sha256', 'XfsmUH3gxM0wW18e6pWv0IP8');
            
            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            const signature = hmac.digest('hex');
    
            if (signature === details["payment[razorpay_signature]"]) {
                resolve();
            } else {
                reject(new Error('Signature mismatch. Payment verification failed.'));
            }
        });
    }
}