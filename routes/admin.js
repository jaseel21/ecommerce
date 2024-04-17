var express = require('express');
const { route } = require('./user');
var router = express.Router();
const productHelpers=require("../helpers/product-helpers")


/* GET users listing. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{

    res.render("admin/view-products",{admin:true,products})
  })
});

router.get('/add-product',(req,res)=>{
res.render('admin/add-product',{admin:true})
})

router.post('/add-product',(req,res)=>{
// console.log(req.body);
// console.log(req.files.Image);
productHelpers.addProduct(req.body,(id)=>{
    
  let image = req.files.Image
  image.mv('./public/product-images/'+id+'.jpg',(err)=>{
    if(!err){
      res.render('admin/add-product')
    } else{
      console.log(err);
    }
  })
})


})

router.get('/delete-product/:id',(req,res)=>{
  console.log(req.params.id);
  productHelpers.deleteProduct(req.params.id).then((response)=>{
console.log(response);
res.redirect('/admin')
  })
  
})

router.get('/edit-product/:id',async(req,res)=>{

  let product = await productHelpers.getProduct(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',((req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body)
  res.redirect('/admin')
  if(req.files.Image){
    image=req.files.Image
    image.mv('./public/product-images/'+req.params.id+".jpg")
  }
}))

module.exports = router;
