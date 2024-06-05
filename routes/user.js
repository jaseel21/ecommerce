var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')

/* GET home page. */
const varifyLogin=(req,res,next)=>{
  if (req.session.loggedIn) {
    next()
  }else{
    res.redirect("/login")
  }

}

router.get('/', function(req, res, next) {
  console.log('called /');
  let user=req.session.user

console.log(user);
  if(user){
    console.log('in / if ');

    let cartCount=productHelpers.cartCount(user._id).then((count)=>{

      console.log(cartCount);
      productHelpers.getAllProducts().then((products)=>{
        console.log(user.Name);
        
        res.render('user/view-products', { products ,user,count});
      })
    })
  }else{
    res.redirect('/login')
  }
    
});

router.get('/login',function(req,res){
  if(req.session.loggedIn){
    res.redirect('/')

  }else{

    
    console.log(req.session.loginErr);
    res.render('user/login',{loginErr:req.session.loginErr})
    req.session.loginErr=false
  }
})

router.get('/signup',function(req,res){
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  console.log('entered');
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true
    req.session.user=response
    
    if(req.session.user){
     
     
      res.redirect("/")
      console.log('if case');
    }else{
      console.log('else case');
      res.redirect('/signup')
    }
  })
})


router.post('/login',function(req,res){
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(req.body);
   console.log(response);
   req.session.loggedIn=response.status
   if(response.status){
     req.session.user=response.user
     console.log(response.status);
    res.redirect('/')
   }else{
    req.session.loginErr="invalid email or password"
    res.redirect('/login')
   }

  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',varifyLogin,async(req,res)=>{
  let cartProducts=await productHelpers.getCartProducts(req.session.user._id)
  let totalValue=await productHelpers.getTotalAmount(req.session.user._id)
  let user=req.session.user
  if(cartProducts ){
    res.render('user/cart',{cartProducts,user,totalValue})
  }else{
    res.redirect('/')
  }

})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log("called");
   productHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{

     res.json({status:true})
     console.log("addddddddd");
   })

})

router.post('/change-quantity',(req,res,next)=>{
  console.log(req.body);
  
  productHelpers.chacgeProQuantity(req.body).then((resolve)=>{

    productHelpers.newQuantity(req.body).then(async(response)=>{
      response={
        count:response,
        proID:req.body.proId
      }
      
      response.total=await productHelpers.getTotalAmount(req.body.user)
      console.log(response);
     
     res.json(response)
  
    })
  })

})

router.post("/remove-cart-product",(req,res)=>{
  console.log(req.body);
  
  res.json("you wnat to delete")

  productHelpers.removeCartProduct(req.body).then((resolve)=>{
  })
 
  
})

router.get("/palce-order",varifyLogin,(req,res)=>{

  productHelpers.getTotalAmount(req.session.user._id).then((response)=>{
    console.log(response);
    res.render("user/place-order",{response,user:req.session.user})
  })
  
})

router.post('/place-order',async(req,res)=>{
 
  console.log(req.body);
  let total=await productHelpers.getTotalAmount(req.body.userId)
  let cart=await productHelpers.getCartProductsList(req.body.userId)
  productHelpers.placeOrder(req.body,total,cart).then((orderID)=>{
    console.log(req.body);
    
    if(req.body['payment-method']=='COD'){
      res.json({codSuccuss:true})
    }else{
      userHelpers.razorpayOrderCreate(orderID,total).then((response)=>{
        console.log('dataa',response);
        res.json({response})
        
      })
    }
  })
  router.post('/verify-payment',(req,res)=>{
    console.log('call v-payment');
  
    console.log(req.body);
   userHelpers.verifyPayment(req.body).then((response)=>{
    res.json({payment:true})
  }).catch((err)=>{
    res.json({payment:false})
  })
   })

  

})

router.get('/order',varifyLogin,async(req,res)=>{
  let orders =await productHelpers.getOrders(req.session.user._id)

  console.log(orders.products);
  res.render('user/order',{user:req.session.user,orders})
})

router.get('/view-orders-products/:id',async(req,res)=>{  
  let products= await productHelpers.getOrderProducts(req.params.id)
  console.log(products);
  res.render("user/view-orders-products",{products})
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success')
})

module.exports = router;
