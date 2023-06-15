let express = require('express');
let app = express();
let port = process.env.port||6250;
let Mongo = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
let {dbConnect,getData,postData,updateOrder,deleteOrder} =  require('./controller/dbController')

//MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

app.get('/',(req,res) => {
    res.send('Hi form Express')
})

// get all category
app.get('/category',async (req,res) => {
    let query ={};
   
    let collection = "category"
    let output = await getData(collection,query)
    res.send(output)
})

// get all products
app.get('/product', async(req,res) => {
    let query ={}
    if (req.query.categoryId){
        query ={category_id: Number(req.query.categoryId)}
    }else{
        query = {}
    }
    let collection = "product";
    let output = await getData(collection,query)
    res.send(output)
})

//get quicksearch
app.get('/quicksearch',async (req,res) => {
    let query ={};
    let collection = "quicksearch"
    let output = await getData(collection,query)
    res.send(output)
})

// get all items 
app.get('/items',async (req,res) => {
    let query ={}
    if (req.query.productId){
        query ={product_id: Number(req.query.productId)}   
    }
    else if(req.query.colorId){
        query ={"colors.color_id": Number(req.query.colorId)}
    }
    else{
        query = {}
    }
    let collection = "items"
    let output = await getData(collection,query)
    res.send(output)
})

//filter color  +  cost

app.get('/filter/:itemId', async(req,res) =>{
    let itemId = Number(req.params.itemId);
   let colorId = Number(req.query.colorId);
   let lcost = Number(req.query.lcost)
   let hcost = Number(req.query.hcost)
   if(colorId){
    query ={
        "colors.color_id":colorId
     }
   }else if(lcost && hcost){
    query ={
        "cost":{$gte:lcost,$lte:hcost}
           }
   }
   else{
    query ={}
   }
let collection ="items";
let output = await getData(collection,query);
res.send(output)
})

//details
app.get('/details/:id', async(req,res) =>{    
    let id = Number(req.params.id);
    let query = {item_id:id}
    let collection = "items"
    let output = await getData(collection,query);
    res.send(output)
})

//list of orders
app.get('/orders', async(req,res) =>{
    let query ={};
    let collection = "orders";
    let output = await getData(collection,query);
    res.send(output) 
})

//placeOrder
app.post('/placeOrder', async(req,res) =>{
    let data = req.body;
    let collection = "orders";
    console.log(">>>",data)
    let response = await postData(collection,data)
    res.send(response)
})

//Add to Cart {"id":[9,12]}
app.post('/addToCart', async(req,res) =>{
    if(Array.isArray(req.body.id)){
        let query = {item_id:{$in:req.body.id}};
        let collection = 'items';
        let output = await getData(collection,query);
        res.send(output)
    }else{
        res.send('Please Pass data in form of array')
    }
})

//Update Order
app.put('/updateOrder', async(req,res) =>{
    let collection = 'orders';
    let condition = {"_id":new Mongo.ObjectId(req.body._id)}
    let data = {
        $set:{
            "status":req.body.status
        }
    }
    let output = await updateOrder(collection,condition,data)
    res.send(output)
})

//Delete Order
app.delete('/deleteOrder', async(req,res) => {
    let collection = 'orders';
    let condition = {"_id":new Mongo.ObjectId(req.body._id)}
    let output = await deleteOrder(collection,condition)
    res.send(output)
}) 


app.listen(port,(err) => {
    dbConnect()
    if(err) throw err;
    console.log(`server is running on port ${port}`)
})