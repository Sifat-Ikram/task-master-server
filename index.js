const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 4321;

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqljyn.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollection = client.db("task-master").collection("task");

        // user api
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        app.get("/user", verifyToken, verifyAdmin, async (req, res) => {
            // console.log(req.headers);
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        // tour api
        app.get("/task", async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        })

        app.post("/task", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        })
        app.delete("/task/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/task/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    title: item.title,
                    division: item.division,
                    price: parseFloat(item.price),
                    deadline: item.deadline,
                    places: item.places,
                    transportation: item.transportation,
                    included_item: item.included_item,
                    description: item.description,
                    image: item.image
                }
            }

            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //   bookings api
        app.post('/bookings', async (req, res) => {
            const bookingItem = req.body;
            const result = await bookingCollection.insertOne(bookingItem);
            res.send(result);
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const admin = req.query.admin;
            let query = {};

            if (email) {
                query.email = email;
            } else if (admin) {
                query.admin = admin;
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })
        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })
        app.delete("/bookings/admin/:id", async (req, res) => {
            const id = req.params.id;
            const query = { eventId: new ObjectId(id) };
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
    res.send("task master is mastering")
})

app.listen(port, () => {
    console.log(`task master is mastering through port ${port}`);
})