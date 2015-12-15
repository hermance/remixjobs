// server.js

//https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');       
var app = express();
var bodyParser = require('body-parser');
var sync = require('synchronize');
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;
var scrap = require('./modules/scrap.js');
var search = require('./modules/search.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//configure database acces
var mongo_url = 'mongodb://localhost:27017/jobs';
var mongoose = require('mongoose');
mongoose.connect(mongo_url);
var Job = require('./models/job');
//var Company = require('./models/company');


var port = 9090;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    //console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});


// on routes that end in /jobs
// ----------------------------------------------------
router.route('/jobs')

    .post(function (req, res) {

        var job = new Job();
        job._id = req.body._id;
        job.title = req.body.title;
        job.company = req.body.company;
        job.localization = req.body.localization;
        job.category = req.body.category;
        job.description = req.body.description;
        job.contract = req.body.contract;
        job.date = req.body.date;
        job.tags = req.body.tags;

        job.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Job created!'});
        });

    })

    .get(function (req, res) {
        Job.find(function (err, jobs) {
            if (err)
                res.send(err);

            res.json(jobs);
        });
    });

// on routes that end in /jobs/:job_id
// ----------------------------------------------------
router.route('/jobs/:job_id')

    .get(function (req, res) {
        Job.find({_id: req.params.job_id}, function (err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    })


    .put(function (req, res) {

        var id = req.params.job_id;

        var job = {};
            req.body.title ? job.title = req.body.title : '';
            req.body.company ? job.company = req.body.company : '';
            req.body.localization ? job.localization = req.body.localization : '';
            req.body.category ? job.category = req.body.category : '';
            req.body.description ? job.description = req.body.description : '';
            req.body.contract ? job.contract = req.body.contract : '';
            req.body.date ? job.date = req.body.date : '';
            req.body.tags ? job.tags = req.body.tags : '';

        Job.update({_id: id}, job, {upsert: true}, function (err, userObj) {
            if (err) {
                res.send(err);
            } else {
                //console.log('update successfully');
                res.status('200').json({message: 'Job updated!'});
            }
        });
    })

    .delete(function (req, res) {
        Job.remove({
            _id: req.params.job_id
        }, function (err, bear) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });

// on routes that end in /jobs/type/params
// ----------------------------------------------------


router.route('/jobs/contract/:contract')

    .get(function (req, res) {
        Job.find({contract: req.params.contract}, function (err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    });

router.route('/jobs/more/recent')

    .get(function (req, res) {
        Job.find({date: {$regex : ".*heures.*"} }, function (err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    });

router.route('/jobs/category/:category')

    .get(function (req, res) {
        Job.find({category: req.params.category}, function (err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    });

router.route('/jobs/where/:localisation')

    .get(function (req, res) {
        Job.find({localization: req.params.localization}, function (err, job) {
            if (err)
                res.send(err);
            res.json(job);
        });
    });

router.route('/jobs/limit/:value')

    .get(function (req, res) {
        Job.find( function (err, job) {
            if (err)
                res.send(err);
            res.json(job.slice(0,req.params.value));
        });
    });



// on routes that end in /companies
// ----------------------------------------------------
router.route('/companies')

    .get(function (req, res) {
        Job.find(function (err, jobs) {
            if (err)
                res.send(err);

            var compagnies = [];
            for (var i in jobs) {
                compagnies.push(jobs[i].company);
            }

            res.json(compagnies);
        });
    });

router.route('/companies/:company_name')

    .get(function (req, res) {
        Job.find(function (err, jobs) {
            if (err)
                res.send(err);

            var result = [];
            for (var i in jobs) {
                if (jobs[i].company === req.params.company_name) {
                    result.push(jobs[i]);
                }
            }

            res.json(result);
        });
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port)
console.log('Magic happens on port ' + port);

fiber(function () {
    var jobs = await(scrap('https://remixjobs.com', defer()));
    for (var i in jobs) {
        var job = jobs[i];
        job = await(search(job, defer()));
        jobs[i] = job;

        Job.update({_id: job._id}, job, {upsert: true}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('saved successfully');
            }
        });

    }

    var jobs = await(scrap('https://remixjobs.com/?page=2&in=all', defer()));
    for (var i in jobs) {
        var job = jobs[i];
        job = await(search(job, defer()));
        jobs[i] = job;

        Job.update({_id: job._id}, job, {upsert: true}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('saved successfully');
            }
        });

    }

});
