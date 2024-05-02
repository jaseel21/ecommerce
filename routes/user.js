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
  console.log(cartProducts);
  let user=req.session.user
res.render('user/cart',{cartProducts,user})
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

  })
  productHelpers.newQuantity(req.body).then((resolve)=>{
    res.json(resolve)
  })

})

router.post("/remove-cart-product",(req,res)=>{
  console.log(req.body);
  productHelpers.removeCartProduct(req.body).then((resolve)=>{

  })
})


module.exports = router;
