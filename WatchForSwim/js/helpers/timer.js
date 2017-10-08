/*
 *      Copyright (c) 2014 Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global define*/
/*jslint plusplus: true*/

/**
 * Timer helper module.
 *
 * @module helpers/timer
 * @namespace helpers/timer
 */
define({
    name: 'helpers/timer',
    def: function helpersTimer() {
        'use strict';

        /**
         * Divisor table used by the splitTime.
         *
         * The array describes the ratio between two consecutive digits
         * on the stopwatch.
         * Eg. the 1st digit (tens of minutes) described by divs[0]
         * is 6 times less worth than the 2nd digit (ones of minutes).
         *
         * @memberof helpers/timer
         * @private
         * @type {number[]}
         */
        var divs = [6, 10, 6, 10, 10, 10];

        /**
         * Calculates digits for the timer.
         *
         * @memberof helpers/timer
         * @public
         * @constructor
         * @param {number} ms Milliseconds since the start.
         * @returns {Time} Time instance.
         */
        function Time(ms) {
            if (ms === undefined) {
                return;
            }
            var r = 0,
                i = divs.length;

            if (ms < 0) {
                throw new Error('Can\'t split time smaller than 0');
            }

            this.input = ms;

            r = Math.floor(ms / 10); // we're not interested in milliseconds

            while (i--) {
                // Calculates digits from right to the left, one at a time.
                //
                // 'r' is the remaining time in current units (eg. in seconds
                // on the 3rd interaction or in minutes on the 5th one)
                // 'divs' describe the ratio between digits on the stopwatch.
                //
                // In order to get the current digit, the remainder 'r' from
                // the previous step is modulo-divided by the value (ratio)
                // of the next (higher) unit.
                r = (r - (this[i] = r % divs[i])) / divs[i];
            }

            this.length = divs.length;
            return this;
        }

        /**
         * Returns 0 if given value is falsy. Otherwise,
         * given value will be returned.
         *
         * @memberof helpers/timer
         * @private
         * @param {*} value
         * @returns {*}
         */
        function getValue(value) {
            return value || 0;
        }

        Time.prototype = [];

        /**
         * Converts Time to a string.
         *
         * @public
         * @returns {string}
         */
        Time.prototype.toString = function Time_toString() {
            var str = '';

            str += getValue(this[0]);
            str += getValue(this[1]);
            str += ':';
            str += getValue(this[2]);
            str += getValue(this[3]);
            str += '.';
            str += getValue(this[4]);
            str += getValue(this[5]);

            return str;
        };

        return {
            Time: Time
        };
    }
});
