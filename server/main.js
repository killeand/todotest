const Express = require('express');
const Mongoose = require('mongoose');
const HTTP = require('http');
const Cors = require('cors');
const _ = require('lodash');

const Task = require('./Task.js');
const Settings = require('../settings.json');

const APP = Express();
const PORT = 4000;
const MONGO_CSTRING = Settings.mongostring;

HTTP.createServer(APP).listen(PORT, (error) => {
    if (error) {
        console.error(`Could not start Express on port ${PORT} for reason:\n\n${error}`);
        return;
    }
    else {
        console.info(`Started Express on port ${PORT}`);
    }
});

Mongoose.connect(MONGO_CSTRING, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (error) {
        console.error(`Could not connect to MongoDB on ${MONGO_CSTRING} for reason:\n\n${error}`);
        return;
    }
    else {
        console.info(`Connected to MongoDB on ${MONGO_CSTRING}`);
    }
});

APP.use(Cors());

APP.get("/data/v1/clear", (req, res, next) => {
    Task.deleteMany({}, (error, response) => (error)?console.error(error):null);

    res.status(200).send("CLEARED");
    return;
});

APP.post("/data/v1/create", Express.json(), (req, res, next) => {
    if (req.headers['content-type'] == 'application/json') {
        Task.create({ text: req.body.text, checked: req.body.checked }, (error, response) => (error)?console.error(error):null);
        res.status(200).send("CREATED");
    }
    else {
        res.status(400).send("NOT JSON");
    }
    
    return;
});

APP.get("/data/v1/read", async (req, res, next) => {
    let data = await Task.find({});

    res.status(200).json(data);
    return;
});

APP.post("/data/v1/update", Express.json(), (req, res, next) => {
    if (req.headers['content-type'] == 'application/json') {
        Task.updateOne({ _id: req.body.id }, { text: req.body.text, checked: req.body.checked }, (error, response) => (error)?console.error(error):null);
        res.status(200).send("UPDATED");
    }
    else {
        res.status(400).send("NOT JSON");
    }
    
    return;
});

APP.post("/data/v1/delete", Express.json(), (req, res, next) => {
    if (req.headers['content-type'] == 'application/json') {
        Task.deleteOne({ _id: req.body.id }, (error, response) => (error)?console.error(error):null);
        res.status(200).send("DELETED");
    }
    else {
        res.status(400).send("NOT JSON");
    }
    
    return;
});

APP.get("/data/v1/watch/task", (req, res, next) => {
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    }).flushHeaders();

    res.write("retry: 10000");
    res.write("data:flush\n\n");

    Task.watch().on('change', (change) => {
        let event = { action: change.operationType, task: null};

        if (change.operationType == 'insert') {
            event.task = { 
                _id: change.fullDocument._id, 
                text: change.fullDocument.text, 
                checked: change.fullDocument.checked 
            };
        }
        else if (change.operationType == 'delete') {
            event.task = { 
                _id: change.documentKey._id
            };
        }
        else if (change.operationType == 'update') {
            event.task = { _id: change.documentKey._id };

            _.assign(event.task, change.updateDescription.updatedFields);
        }

        res.write("data:" + JSON.stringify(event) + "\n\n");
    });

    res.on('close', () => {
        console.log("Closed SSE Connection");
        res.end();
    });
});