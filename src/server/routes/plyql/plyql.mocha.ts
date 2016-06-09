import path = require('path');
import supertest = require('supertest');
import mime = require('mime');

// import app = require('../../app');

//import { dataSourceManagerFactory } from 'imply-pivot/build/server/utils/index';
//
//import { initDatasourceManager } from '../../datasource';
//import { TEST_DATA_SOURCES } from '../../utils/test-data-sources';
//
//var fileDirectory = path.join(__dirname, '../../../../node_modules/imply-pivot/');
//initDatasourceManager(dataSourceManagerFactory({
//  dataSources: TEST_DATA_SOURCES
//}));

var pageQuery = "SELECT SUM(added) as Added FROM `static-wiki` GROUP BY page ORDER BY Added DESC LIMIT 10;";
var timeQuery = "SELECT TIME_BUCKET(time, 'PT1H', 'Etc/UTC') as TimeByHour, SUM(added) as Added FROM `static-wiki` GROUP BY 1 ORDER BY TimeByHour ASC";

interface PlyQLTestQuery {
  outputType: string;
  query: string;
  testName: string;
}

var tests: PlyQLTestQuery[] = [
  {
    outputType: "json",
    query: pageQuery,
    testName: "POST json pages added /plyql"
  },
  {
    outputType: "json",
    query: timeQuery,
    testName: "POST json timeseries /plyql"
  },
  {
    outputType: "csv",
    query: pageQuery,
    testName: "POST csv pages added /plyql"
  },
  {
    outputType: "csv",
    query: timeQuery,
    testName: "POST csv timeseries /plyql"
  },
  {
    outputType: "tsv",
    query: pageQuery,
    testName: "POST tsv pages added /plyql"
  },
  {
    outputType: "tsv",
    query: timeQuery,
    testName: "POST tsv timeseries /plyql"
  }
];

function responseHandler(err: any, res: any) {
  console.log("Response Type: " + res.type);
  console.log("Response Text: " + res.text);
}

function testPlyqlHelper(testName: string, contentType: string, queryStr: string) {
  // it(testName, (done) => {
  //   supertest(app)
  //     .post('/plyql')
  //     .set('Content-Type', "application/json")
  //     .send(queryStr)
  //     //.expect(function(res: any) { return res.type === contentType ? false : "content-type mismatch"; })
  //     .expect('Content-Type', contentType + "; charset=utf-8")
  //     .expect(200)
  //     .end(function (err: any, res: any) {
  //       //responseHandler(err, res);
  //       done(err);
  //     });
  // });
}

describe.skip('PlyQL', () => {
  tests.forEach(function(test) {
    testPlyqlHelper(test.testName, mime.lookup(test.outputType), JSON.stringify(test, null, 2));
  });
});
