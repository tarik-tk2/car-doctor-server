const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
var cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const port = 4000;
console.log("hello", process.env.DB_NAME);
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.woqsvm5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("car-doctor");
    const services = database.collection("services");
    const booking = database.collection("bookings");
    const products = database.collection("products");
    app.get("/services", async (req, res) => {
      const { page, limit } = req.query;
      const skip = (page - 1) * limit;

      const allService = await services.find({}).skip(skip).limit(parseInt(limit)).toArray();
      res.send(allService);
    });
    // single service
    
    app.get("/service/:id", async (req, res) => {
      const reqId = req.params.id;
    
      const query = { _id: reqId };
      const options = {
        projection: { title: 1, service_id: 1, img: 1, price: 1 },
      };
      const service = await services.findOne(query, options);
      res.send(service);
    });
    app.post("/booking", async (req, res) => {
      const reqBody = req.body;
      const result = await booking.insertOne(reqBody);
      res.send(result);

    })
    app.get('/bookings',async (req, res) => {
      const query = {};
      if (req.query?.email) {      
        const query = { email: req.query.email }
        const find = await booking.find(query).toArray();
        res.send(find);
      }
 
      
    }
    )
    app.delete('/booking/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) }
     
      const result = await booking.deleteOne(query);
      res.send(result)
    })
    // products api
    app.get("/products", async (req, res) => { 
      const { page, limit } = req.query;
      const skip = (page - 1) * limit;
      const allProducts = await products.find({}).skip(skip).limit(parseInt(limit)).toArray();
      res.send(allProducts)
    })
    app.get("/product/:id", async (req, res) => {
      const reqId = req.params.id;
      const query={_id:reqId}
      const findProduct = await products.findOne(query);
      res.send(findProduct);
    })


  
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
