var express = require('express');
var bp = require('body-parser');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient
var cluster = require('cluster');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

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
    MongoClient.connect('mongodb://admin:admin@ds147599.mlab.com:47599/asha_db', (err, database) =>{
        if(err) return console.log(err)
        db = database
    })


    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'views/index.html'));
    });

    app.post('/upload', function(req, res){

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);

    });


    var id = 1;
    var tasks =[];
    app.use(bp.json());

    //store in MongoDb
    app.post('/tasks', function(req,res){
        console.log(req.body);
        db.collection('mytasks').save(req.body,(err,result) => {
            if(err) return console.log(err)
            res.json({"msg" :"Saved to database"});
        })
    });


    app.get('/tasks', (req,res) => {
    
        db.collection('mytasks').find().toArray((err,result) => {
            if(err) return console.log(err)
            res.json(result);
    })
    
    });
    app.get('/tasks',  (req,res) => {
    
        res.send("Hello from Worker" + cluster.worker.id);

    
    });

    app.get('/tasks/:id',(req,res) => {
        var tmpid = parseInt(req.params.id);
        var result = _.findWhere(tasks,{id : tmpid});
        if(result){
            res.json(result);
        }else {
            res.status(404).json({ "error" : "Id not found"});
        }
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