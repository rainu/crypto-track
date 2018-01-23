"use strict";

const cheerio = require('cheerio');
const moment = require('moment');
const parse = require('csv-parse');

const log = require('../../common/src/log');
const request = require('../../common/src/request_repeater');
const Course = require('../../web/src/model/course');
const CourseType = require('../../web/src/model/course_type');

const MIN_DATE = moment('2010-01-01');

/**
 * Get Exchange ratios from the given Date. Here we ask some
 * server to get this data!
 *
 * @param startDate
 * @return {Promise<any>}
 */
const getExchange = (startDate) => {
  return new Promise((resolve, reject) => {
    const now = moment();
    let curDate = moment(startDate);
    let allCourses = {};
    let p = [];

    do{
      let fCurDate = curDate.format('DD.MM.YYYY');
      const url = `https://www.onvista.de/onvista/boxes/historicalquote/export.csv?notationId=8381868&dateStart=${fCurDate}&interval=Y5`;

      let promise = new Promise((_resolve, _reject) => {
        const parser = parse({delimiter: ';', auto_parse: true, columns: true, skip_empty_lines: true});
        request(url).then(response => {
          parser.write(response.body);
          parser.end();
        }, err => _reject(err));

        parser.on('readable', () => {
          let record;

          while (record = parser.read()) {
            const rawDate = record['Datum'].trim();
            const rawCourse = record['Schluss'].trim()
              .replace(',', '_')
              .replace('.', '')
              .replace('_', '.');
            const course = parseFloat(rawCourse);

            allCourses[rawDate] = {
              date: rawDate,
              course: course,
            };
          }
        });
        parser.on('finish', () => {
          _resolve()
        });
        parser.on('error', (err) => {
          //for this csv i expect this error (invalid csv)
          log.debug('Error while parsing csv!', err);
          _resolve(err);
        });
      });
      p.push(promise);

      curDate.add(5, 'years');
    }while(curDate <= now);

    Promise.all(p).then(() => {
      resolve(allCourses);
    }, err => reject(err));
  });
};

/**
 * Update the exchange ration (USD->EUR; EUR->USD) based on stored
 * data. Here we only get missing dates.
 *
 * @return {Promise<any>}
 */
const updateExchanges = () => {
  return new Promise((resolve, reject) => {
    Course.find({ symbol: `EURUSD`, type: CourseType.HISTORY })
    .limit(1)
    .sort({ date: 'desc' })
    .select({ date: 1})
    .exec((err, courses) => {
      if (err) {
        reject(err);
        return;
      }

      let date = MIN_DATE;
      if(courses.length > 0) {
        date = moment(courses[0].date);
      }
      getExchange(date).then(mapping => {
        //remove to avoid duplicate-keys
        Course.find({
          symbol: { $in: ['USDEUR', `EURUSD`] },
          date: { $gte: date },
          type: CourseType.HISTORY,
        }).remove().then(() => {
          let p = [];
          for(let curDate of Object.keys(mapping)){
            const eurUsd = new Course({
              symbol: "EURUSD",
              date: moment(curDate, "DD.MM.YYYY").toDate(),
              course: mapping[curDate].course,
              type: CourseType.HISTORY,
            });
            const usdEur = new Course({
              symbol: "USDEUR",
              date: moment(curDate, "DD.MM.YYYY").toDate(),
              course: 1 / mapping[curDate].course,
              type: CourseType.HISTORY,
            });

            log.debug('Save new exchange course: ' + eurUsd);
            p.push(eurUsd.save());

            log.debug('Save new exchange course: ' + usdEur);
            p.push(usdEur.save());
          }

          console.log('Finished reading exchanges');
          Promise.all(p).then(() => resolve(), err => reject(err));

        }, err => reject(err));
      });
    });
  });
};

/**
 * Load all known Exchanges (USD->EUR) from our database.
 *
 * @return {Promise<any>}
 */
const loadExchanges = () => {
  return new Promise((resolve, reject) => {
    Course.find({
      symbol: 'USDEUR',
      type: CourseType.HISTORY,
    }).then(courses => {
      let mapping = {};
      for(let curCourse of courses){
        const dateKey = moment(curCourse.date).format('DD.MM.YYYY');
        mapping[dateKey] = curCourse;
      }
      resolve(mapping);
    }, err => reject(err))
  });
};

/**
 * Get the mapping from coinmarketcap which can be used for
 * getting historical data from coinmarketcap.
 *
 * @return {Promise<any>}
 */
const getMapping = () => {
  const url = "https://coinmarketcap.com/all/views/all/";

  return new Promise((resolve, reject) => {
    const mapping = {};

    request(url).then((response) => {
      const $ = cheerio.load(response.body);

      $('table.table tbody tr').each(function (i, elem) {
        const cells = $(this).find('td');
        const rank = cells.eq(0).text();
        const symbol = cells.eq(2).text();
        const link = cells.eq(1).find('a').attr('href');

        mapping[symbol] = {};
        mapping[symbol].link = link;
        mapping[symbol].rank = parseInt(rank);
      });

      resolve(mapping);
    }, err => reject(err))
  });
};

/**
 * Update the given coin based on stored
 * data. Here we only get missing dates.
 *
 * @param mapping
 * @param USDEURRatio
 * @param coin
 * @return {Promise<any>}
 */
const updateCourses = (mapping, USDEURRatio, coin) => {
  return new Promise((resolve, reject) => {
    Course.find({ symbol: `${coin}USD`, type: CourseType.HISTORY })
      .limit(1)
      .sort({ date: 'desc' })
      .select({ date: 1})
      .exec((err, courses) => {
        if(err) {
          reject(err);
          return;
        }

        let date = MIN_DATE;
        if(courses.length > 0) {
          date = moment(courses[0].date);
        }

        const start = date.format('YYYYMMDD');
        const end = moment().add(-1, 'days').format('YYYYMMDD');
        const coinEndpoint = mapping[coin].link;
        const url = `https://coinmarketcap.com/${coinEndpoint}/historical-data/?start=${start}&end=${end}`;

        log.info("Get historical course for " + coin);
        request(url).then((response) => {
          const $ = cheerio.load(response.body);
          let newCourses = [];

          $('table.table tbody tr').each(function (i, elem) {
            const cells = $(this).find('td');
            const rawDate = cells.eq(0).text();
            const rawCourse = cells.eq(4).text();

            const usdCourse = {
              symbol: `${coin}USD`,
              date: moment(rawDate, "MMM DD, YYYY").toDate(),
              course: parseFloat(rawCourse),
              type: CourseType.HISTORY,
            };
            const eurCourse = {
              symbol: `${coin}EUR`,
              date: usdCourse.date,
              course: usdCourse.course / USDEURRatio[moment(usdCourse.date).format('DD.MM.YYYY')].course,
              type: usdCourse.type,
            };

            newCourses.push(new Course(usdCourse));
            newCourses.push(new Course(eurCourse));
          });

          //remove to avoid duplicate-keys
          Course.find({
            symbol: { $in: [`${coin}USD`, `${coin}EUR`] },
            date: { $gte: date },
            type: CourseType.HISTORY,
          }).remove().then(() => {
            //save all
            let p = [];
            for(let course of newCourses) {
              log.debug('Save new course: ' + course);
              p.push(course.save());
            }

            console.log('Finished parsing of coin ' + coin);
            Promise.all(p).then(() => resolve(), err => reject(err));
          }, err => reject(err));
        }, err => reject(err));
      });
  });
};

const doJob = function() {
  return new Promise((resolve, reject) => {
    updateExchanges().then(() => {

      loadExchanges().then((USDEURRatio) => {

        getMapping().then((mapping) => {

          //we only interested in the top100 coins (at the moment)
          let top100 = {};
          for(let coin of Object.keys(mapping)){
            if(mapping[coin].rank <= 100){
              top100[coin] = mapping[coin];
            }
          }

          let p = [];
          for(let coin of Object.keys(top100)) {
            let promise = updateCourses(top100, USDEURRatio, coin);
            p.push(promise);
          }
          Promise.all(p).then(() => resolve(), err => reject(err));

        }, err => reject(err));

      }, err => reject(err));

    }, err => reject(err));
  });
};

module.exports = doJob;