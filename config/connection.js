const  {MongoClient} =require("mongodb")

const state={
    db:null
}
console.log("test mode one ");
module.exports.connect=function(done){

    const url='mongodb://localhost:27017'
    const dbname ='ecommerce'
    

    MongoClient.connect(url).then((data)=>{
      
        state.db=data.db(dbname)
        done()
    }).catch((err)=>{
        done(err)
    })
    // MongoClient.connect(url,(err,data)=>{
    //     console.log("test mode trhee ");
    //     if(err) return done(err)
    //     state.db=data.db(dbname)

        

    // done()
    // })
}

module.exports.get=function(){
    
    return state.db
}