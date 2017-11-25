'use strict';

var _ = require('underscore');

/**
 * Cumulative average metric.
 */
class CumulativeAverage {
  /**
   * @param {Object} [options] Averaging options.
   * - {Number} precision Output decimal precision.
   */
  constructor(options) {
    this.options = _.clone(options) || {};

    this._reset();
  }

  /**
   * Adds a value to this cumulative average.
   *
   * @param {Number} value Value to add.
   */
  add(value) {
    this.sum += value;
    this.count++;
  }

  /**
   * Returns the current average value and resets the counters.
   *
   * @returns {Number} Current average value.
   */
  getAndReset() {
    var ret = this.count !== 0 ? this.sum / this.count : 0;

    if (this.options.precision) {
      ret = parseFloat(ret.toFixed(this.options.precision));
    }

    this._reset();

    return ret;
  }

  /**
   * Resets this cumulative average.
   *
   * @private
   */
  _reset() {
    this.sum = 0;
    this.count = 0;
  }

  toJSON() {
    return this.getAndReset();
  }
}

module.exports = CumulativeAverage;