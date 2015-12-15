/**
 * Created by adrien on 09/12/2015.
 */

var request = require('request');
var cherrio = require('cheerio');

module.exports = function (job, callback) {

    request('https://remixjobs.com/emploi/bim/bam-boom/' + job._id, function (err, res, body) {
        $ = cherrio.load(body);
        var title, localisation, company, description, contract, tags, date;

        $jobTitle = $('.job-title');
        title = $('h1', $jobTitle).text();

        jobInfos = $('.job-infos li', $jobTitle).text().replace(/(?:\r\n|\r|\n)/g, '').replace(/ +/g, '').split(',');

        company = jobInfos[0];
        date = jobInfos[1];
        contract = jobInfos[2];
        localisation = jobInfos[3];

        tags = [];
        $('.tag', $jobTitle).each(function () {
            var tag = $(this).attr('data-tag-name');
            tags.push(tag);
        });

        description = $('.job-description').text().replace(/(?:\r\n|\r|\n)/g, '').replace(/ +/g, ' ');

        job.title = title;
        job.localization = localisation;
        job.company = company;
        job.description = description;
        job.contract = contract;
        job.tags = tags;
        job.date = date;

        callback(null, job);
    });
};
