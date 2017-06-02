var cluster = require('cluster');

var express=require('express');
 
if (cluster.isMaster) {

 // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
// Code to run if we're in a worker process
} else {



var app= express();

app.get('/getmydata',function(req,res){
res.send('Hello from Worker ' + cluster.worker.id);

});
app.listen(3000, function(req, res){
console.log('Worker %d running!', cluster.worker.id);
})
	cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker %d died :(', worker.id);
    cluster.fork();

});
}