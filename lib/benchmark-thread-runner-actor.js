'use strict';

var mongoDbBenchmark = require('./mongodb-benchmark');

/**
 * Runs a single benchmark thread.
 */
class BenchmarkThreadRunnerActor {
  /**
   * Runs benchmark with given concurrency level.
   *
   * @param {Number} concurrencyLevel Concurrency level.
   * @returns {Promise} Result promise.
   */
  run(concurrencyLevel) {
    return mongoDbBenchmark.run(concurrencyLevel);
  }
}

module.exports = BenchmarkThreadRunnerActor;