const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));


const port = 5000;
const dbUser = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;
const todo_tbl = process.env.TODO_TBL;


app.get('/', (req, res) => {
    res.send('backend is working');
});


const uri = `mongodb+srv://${dbUser}:${password}@cluster0.ou4zy.mongodb.net/${db_name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const taskCollection = client.db(db_name).collection(todo_tbl);

    // CREATE
    app.post('/addTask', (req, res) => {
        const task = req.body;
        taskCollection.insertOne(task)
            .then(result => res.send(result.insertedCount > 0));
    });

    // READ
    app.get('/allTasks', (req, res) => {
        taskCollection.find({})
            .toArray((err, document) => {
                res.send(document);
            });
    });

    // UPDATE
    app.patch('/update/:id', (req, res) => {
        const id = req.params.id;

        taskCollection.updateOne(
            { _id: ObjectID(id) },
            { $set: { taskName: req.body.taskName, startTime: req.body.startTime, endTime: req.body.endTime, date: req.body.date } }
        )
            .then(result => res.send(result.modifiedCount > 0));
    });

    // DELETE
    app.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
        taskCollection.deleteOne({ _id: ObjectID(id) })
            .then(result => res.send(result.deletedCount > 0));
    });

});


app.listen(port);