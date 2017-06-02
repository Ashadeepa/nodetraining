var express = require('express');
var bp = require('body-parser');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient
var cluster = require('cluster');

if(cluster.isMaster){

    //Counter the machine's CPUs
    var cpuCount = require('os').cpus().length;

    //Create a worker for each CPU
    for(var i = 0; i<cpuCount; i +=1){
        cluster.fork();
    }

//Code to run if we're in worker process
} 

else
{
    var app = express();
    var db

    app.get('/tasks',  (req,res) => {
    
        res.send("Hello from Worker " + cluster.worker.id);   
    });

    app.delete('/tasks/:id',(req,res) => {
        db.collection('mytasks'.findOneAndDelete({name: req.body.task}, (err,result) => {
        if(err) return res.send(500,err)
        res.send('Record deleted')  
        }))

    });

    app.listen(3000,() => {
            console.log("Server is up." + cluster.worker.id);
        })
}