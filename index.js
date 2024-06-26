const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhnq0hd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("carDoctor");
        // collections
        const serviceCollection = database.collection('services');
        const bookingCollection = database.collection('bookings')
        // api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, price: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })
        // bookings
        app.get('/bookings', async(req, res) =>{
            console.log(req.query.email);
            let query = {};
            if(req.query?.email){
                query = {email : req.query.email}
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/bookings', async(req, res) =>{
            const bookingDetails = req.body;
            console.log(bookingDetails);
            const result = await bookingCollection.insertOne(bookingDetails);
            res.send(result);
        })
        app.delete('/booking/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('doctor is running');
})
app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`);
})