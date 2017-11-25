'use strict';

var actors = require('comedy');
var P = require('bluebird');

/**
 * Runs benchmark in a given number of threads with
 * concurrency level 4.
 */
class BenchmarkRunnerActor {
  initialize(selfActor) {
    this.selfActor = selfActor;
  }

  /**
   * Runs benchmark in a given number of threads.
   *
   * @param {Number} nThreads Number of parallel benchmark threads.
   * @returns {P} Benchmark aggregate result promise.
   */
  run(nThreads) {
    return this.selfActor
      .createChild('/lib/benchmark-thread-runner-actor', {
        mode: 'forked',
        clusterSize: nThreads
      })
      .then(child => child.broadcastAndReceive('run', 4))
      .reduce((memo, threadResult) => {
        if (!memo) return threadResult;

        memo.write['Average throughput (requests per second)'] +=
          threadResult.write['Average throughput (requests per second)'];
        memo.read['Average throughput (requests per second)'] +=
          threadResult.read['Average throughput (requests per second)'];

        return memo;
      });
  }
}

var threadCounts = [1, 2, 4];
var actorSystem = actors();

actorSystem
  .rootActor()
  .then(rootActor => {
    return P.each(threadCounts, threadCount => {
      console.log(`=== Running benchmark in ${threadCount} thread(s) ===`);

      return rootActor
        .createChild(BenchmarkRunnerActor)
        .then(runner => {
          return runner.sendAndReceive('run', threadCount)
            .then(result => {
              console.log(`Benchmark result for thread count ${threadCount}:`);
              console.log(JSON.stringify(result, null, 2));
            })
            .finally(() => runner.destroy());
        });
    });
  })
  .finally(() => actorSystem.destroy());