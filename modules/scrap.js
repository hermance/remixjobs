var request = require('request');
var cherrio = require('cheerio');

/*
 La Centrale Module-cote
 */

module.exports = function (url, callback) {

    request(url, function (err, res, body) {
        var $ = cherrio.load(body);
        var jobsIds = [];

        $('.job-item').each(function () {
            var id, cat;

            id = $(this).attr('data-job-id');
            cat = $(this).find('a.job-link').attr('href').split('/')[2];
            jobsIds.push({category: cat, _id: id});
        });

        callback(null, jobsIds);
    });
};
