'use strict';

var AbstractThroughputBenchmark = require('./abstract-throughput-benchmark.js');
var mongodb = require('mongodb');
var P = require('bluebird');
var _ = require('underscore');

P.promisifyAll(mongodb);
P.promisifyAll(mongodb.MongoClient);

/**
 * Generates test string of a given length.
 *
 * @param {Number} length String length.
 * @returns {String} Test string.
 */
function testString(length) {
  return _.times(length, () => 'A').join('');
}

var mongoUrl = 'mongodb://localhost:27017/test?w=1';
var testDoc = { data: testString(1024) };

/**
 * Abstract MongoDB throughput benchmark.
 */
class AbstractMongoDbBenchmark extends AbstractThroughputBenchmark {
  setUp() {
    return mongodb.MongoClient.connectAsync(mongoUrl)
      .then(mongoDb => {
        this.mongoDb = mongoDb;
        this.collection = mongoDb.collection('test');
      });
  }

  tearDown() {
    return this.mongoDb.closeAsync();
  }
}

/**
 * Benchmark for MongoDB single insertion throughput.
 */
class WriteThroughputBenchmark extends AbstractMongoDbBenchmark {
  setUp() {
    return super.setUp().then(() => this.mongoDb.dropDatabaseAsync());
  }

  iteration() {
    return this.collection.insertAsync(_.clone(testDoc));
  }
}

/**
 * Benchmark for MongoDB single find throughput.
 */
class ReadThroughputBenchmark extends AbstractMongoDbBenchmark {
  iteration() {
    return this.collection.find().limit(1).toArrayAsync();
  }
}

/**
 * Runs write throughput benchmark.
 *
 * @param {Number} concurrencyLevel Concurrency level.
 * @returns {Promise} Promise, which yields the test results.
 */
function writeThroughputBenchmark(concurrencyLevel) {
  var bm = new WriteThroughputBenchmark();

  return bm.runWithWarmUp({ concurrencyLevel: concurrencyLevel })
    .then(result => {
      console.log('Results for WRITE throughput benchmark:');

      var result0 = {
        'Benchmark type': 'WRITE',
        'Concurrency level': concurrencyLevel,
        'Average throughput (requests per second)': result.averageThroughput
      };

      console.log(result0);

      return result0;
    });
}

/**
 * Runs write throughput benchmark.
 *
 * @param {Number} concurrencyLevel Concurrency level.
 * @returns {Promise} Promise, which yields the test results.
 */
function readThroughputBenchmark(concurrencyLevel) {
  var bm = new ReadThroughputBenchmark();

  return bm.runWithWarmUp({ concurrencyLevel: concurrencyLevel })
    .then(result => {
      console.log('Results for READ throughput benchmark:');

      var result0 = {
        'Benchmark type': 'READ',
        'Concurrency level': concurrencyLevel,
        'Average throughput (requests per second)': result.averageThroughput
      };

      console.log(result0);

      return result0;
    });
}

/**
 * Runs write and read benchmark for given concurrency level.
 *
 * @param {Number} concurrencyLevel Concurrency level (number of parallel sessions).
 * @returns {Promise} Result promise.
 */
exports.run = async function(concurrencyLevel) {
  var writeResult = await writeThroughputBenchmark(concurrencyLevel);
  var readResult = await readThroughputBenchmark(concurrencyLevel);

  return {
    write: writeResult,
    read: readResult
  };
};