var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var fs = require('fs');

var cache = loadJsonSync('./cache.json') || {};

//json config path
var configPath = './config.json';

//nodemailer settings
/*
 * Create emailConf.js and populate it with settings following this example
 * 
 * module.exports = {
 *    service : 'Gmail',
 *   auth : {
 *      user: 'john.smith@gmail.com',
 *        pass: 'johnsmithspasword'
 *    },
 *    from: 'J.S. Automation <john.smith@gmail.com>'
 * };
 */
var email = require('./emailConf');

//Entry point
init();

function init() {
    scrapeAll();
    setInterval(function () {
        scrapeAll();
    }, 1000 * 60 * 60);
}

function scrapeAll() {
    var config = loadJsonSync(configPath);
    config.forEach(function (conf) {
        scrape(conf);
    });
}


function avtonet($) {
    var results = [];
    $('.ResultsAd').each(function (i, e) {
        e = $(e);
        var title = e.find('.ResultsAdData a').text();
        var titleLink = e.find('.ResultsAdData a').attr('href');
        var imgSrc = e.find('.ResultsAdPhoto img').attr('src') || e.find('.ResultsAdPhotoContainer img').attr('src');
        var imgLink = e.find('.ResultsAdPhoto a').attr('href') || e.find('.ResultsAdPhotoContainer a').attr('href');
        var description = e.find('.ResultsAdData ul, .ResultsAdData p').text();
        var priceEur = e.find('.ResultsAdPrice').text();
        priceEur = priceEur.trim().split(' ')[0].replace('.', '').replace(',', '.');
        results.push({
            title: title,
            titleLink: titleLink,
            imgSrc: imgSrc,
            imgLink: imgLink,
            description: description,
            priceEur: priceEur
        });
    });
    return results;
}
function bolha($) {
    var results = [];
    $('.ad').each(function (i, e) {
        e = $(e);
        var title = e.find('.content a').text();
        var titleLink = e.find('.content a').attr('href');
        var imgSrc = e.find('.image *[data-original]').attr('data-original');
        var imgLink = e.find('.image a').attr('href');
        var description = e.find('.content').clone().children().remove().end().text();
        var priceEur = e.find('.price').text();
        priceEur = priceEur.split(' ')[0].replace('.', '').replace(',', '.');
        results.push({
            title: title,
            titleLink: titleLink,
            imgSrc: imgSrc,
            imgLink: imgLink,
            description: description,
            priceEur: priceEur
        });
    });
    return results;
}
function nepremicnine($) {
    var results = [];

    $('div.oglas_container').each(function (i, e) {
        e = $(e);
        let title = e.find('span.title').text();                    // "KOPER, MARKOVEC"
        let titleLink = e.find('span.title').parent().attr('href'); // "/oglasi-prodaja/koper-markovec-stanovanje_6199953/"
        let imgSrc = e.find('a.slika>img').attr('src');             // "https://picbase.turbosist.si/slonep_oglasi2/6083250.jpg"
        imgSrc = imgSrc.replace('sIonep_oglasi2', 'slonep_oglasi2')
        let imgLink = e.find('a.slika').attr('href');               // "/oglasi-prodaja/koper-markovec-stanovanje_6199953/"
        let description = e.find(".atributi").text() + e.find(".kratek_container").text();
        let descriptionOneLine = description.replace(/(\r\n\t|\n|\r\t)/gm, ""); // "                                    Nadstropje: 1/4, Leto: 1989,                                                                     61,1 m2, 3-sobno, zgrajeno l. 1989, 1/4 nad., Na Markovcu prodamo 3 sobno stanovanje v 1. nadstropju. Možnost menjave za...                                "
        let priceEur = e.find(".main-data>meta[itemprop='price']").attr("content"); //"150000.00"
        let area = e.find("span.velikost").text().replace(/(\s|m2)/gm, "").replace(",", "."); //"61,10 m2" -> "61.10"

        results.push({
            title: title,
            titleLink: titleLink,
            imgSrc: imgSrc,
            imgLink: imgLink,
            description: description,
            priceEur: priceEur,
            area: area
        });
    });

    return results;
}
function njuskalo($) {
    var results = [];
    $('.entity-body.cf:has(.entity-thumbnail)').each(function (i, e) {
        e = $(e);
        var title = e.find('.entity-title a').text();
        var titleLink = e.find('.entity-title a').attr('href');
        var imgSrc = e.find('.entity-thumbnail img').attr('src');
        var imgLink = e.find('.entity-thumbnail a').attr('href');
        var description = e.find('.entity-description-main').text();
        var datetime = e.find('.entity-pub-date time').attr('datetime');
        var date = e.find('.entity-pub-date time').text();
        var priceEur = e.find('.price--eur').text().split(' ')[0];
        priceEur = priceEur.replace('.', '');
        var priceHrk = e.find('.price--hrk').text().split(' ')[0];
        priceHrk = priceHrk.replace('.', '');
        results.push({
            title: title,
            titleLink: titleLink,
            imgSrc: imgSrc,
            imgLink: imgLink,
            description: description,
            datetime: datetime,
            date: date,
            priceEur: priceEur,
            priceHrk: priceHrk
        });
    });
    return results;
}


function scrape(conf) {
    request(conf.request, function (err, resp, body) {
        if (err)
            throw err;
        var $ = cheerio.load(body);

        var site = siteKind(conf.request.url);
        var results;
        switch (site) {
            case 'avtonet':
                results = avtonet($);
                break;
            case 'bolha':
                results = bolha($);
                break;
            case 'njuskalo':
                results = njuskalo($);
                break;
            case 'nepremicnine':
                results = nepremicnine($);
                break;
            default:
                throw 'Unknown website';
        }
        checkResults(results, conf, site);
    });

}

function checkResults(results, conf, siteKind) {
    var newMatches = [];
    results.forEach(function (e) {
        cache[siteKind] = cache[siteKind] || {};

        if (!cache[siteKind][e.titleLink]) {
            cache[siteKind][e.titleLink] = e;

            if (conf.maxPrice && conf.maxPrice < e.priceEur)
                return;
            if (conf.minPrice && conf.minPrice > e.priceEur)
                return;

            if (conf.maxArea && conf.maxArea < e.area)
                return;
            if (conf.minArea && conf.minArea > e.area)
                return;

            let isMatch = false;
            if (conf.titleKeywords && conf.titleKeywords.length) {

                var matchedKeywords = conf.titleKeywords.filter(function (keyword) {
                    return e.title.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
                });
                if (matchedKeywords.length > 0) {
                    isMatch = true;
                }
            }
            if (conf.matchedDescKeywords && conf.matchedDescKeywords.length) {

                var matchedDescKeywords = conf.descriptionKeywords.filter(function (keyword) {
                    return e.title.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
                });
                if (matchedDescKeywords.length > 0) {
                    isMatch = true;
                }
            }
            if ((!conf.titleKeywords || !conf.titleKeywords.length) && (!conf.matchedDescKeywords || !conf.matchedDescKeywords.length)) {
                // if both keywords arrays are empty or undefined, match all
                isMatch = true;
            }

            if (isMatch) {
                console.log(Date.now() + ' bingo! found new match... ' + e.titleLink + ' (' + siteKind + ')');
                newMatches.push(e);
            }
        }
    });
    alertNewMatches(newMatches, conf, siteKind);
}

function alertNewMatches(newMatches, conf, siteKind) {
    if (!newMatches || !newMatches.length || !conf.subscribers || !conf.subscribers.length)
        return;

    var subject = '✔ Novi oglasi na @site'.replace('@site', siteKind);
    var msgBody = '';
    newMatches.forEach(function (e) {
        msgBody += '<b><a href="@href">@title</a></b><br/><img src="@imgSrc"><br/>@desc<br/>@price€<br/><br/>'.replace('@title', e.title).replace('@desc', e.description).replace('@price', e.priceEur).replace('@imgSrc', e.imgSrc).replace('@href', fixAdUrl(siteKind, e.titleLink));
    });

    sendEmail(subject, msgBody, conf.subscribers);
    saveJsonAsync(cache, './cache.json');

}


function sendEmail(subj, msg, receivers) {
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: email.service,
        auth: {
            user: email.auth.user,
            pass: email.auth.pass
        }
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: email.from, // sender address
        to: receivers.join(','),// list of receivers
        subject: subj, // Subject line
        text: msg, // plaintext body
        html: msg // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

}

function siteKind(url) {
    if (url.toLowerCase().indexOf('avto.net') >= 0)
        return 'avtonet';
    if (url.toLowerCase().indexOf('bolha.com') >= 0)
        return 'bolha';
    if (url.toLowerCase().indexOf('njuskalo.hr') >= 0)
        return 'njuskalo';
    if (url.toLowerCase().indexOf('nepremicnine.net') >= 0)
        return 'nepremicnine';
}

function fixAdUrl(siteKind, titleLink) {
    if (siteKind == 'avtonet')
        return 'http://www.avto.net' + titleLink.substring(2);
    if (siteKind == 'bolha')
        return 'http://www.bolha.com' + titleLink;
    if (siteKind == 'nepremicnine')
        return 'http://www.nepremicnine.net' + titleLink;
}

function saveJsonAsync(object, path) {
    fs.writeFile(path, JSON.stringify(object, null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + path);
        }
    });
}

function loadJsonSync(path) {
    var data,
        myObj;
    try {
        data = fs.readFileSync(path);
    }
    catch (err) {
        console.log('Could not open file ' + path);
        return null;
    }
    try {
        myObj = JSON.parse(data);
        //console.dir(myObj);
    }
    catch (err) {
        console.log('There has been an error parsing your JSON.');
        console.log(err);
    }

    return myObj;
}