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

/*global define, setInterval, clearInterval*/

/**
 * Timer model module.
 *
 * @module models/timer
 * @requires {@link core/event}
 * @namespace models/timer
 */
define({
    name: 'models/timer',
    requires: ['core/event'],
    def: function modelsTimer(e) {
        'use strict';

        /**
         * Lap class constructor.
         *
         * @memberof models/timer
         * @private
         * @param {number} no Lap number.
         * @param {number} time Lap time.
         * @constructor
         */
        function Lap(no, time) {
            this.no = no;
            this.time = time;
        }

        /**
         * Timer class.
         *
         * @memberof models/timer
         * @public
         * @constructor
         * @param {number} delay Delay in milliseconds.
         * @param {function[]|function|string} callbacks
         */
        function Timer(delay, callbacks) {
            if (typeof callbacks === 'function' ||
                        typeof callbacks === 'string') {
                callbacks = [callbacks];
            } else if (callbacks === undefined) {
                callbacks = [];
            }
            this.reset();
            this.callbacks = callbacks;
            this.delay = delay;
            this.id = setInterval(this.tick.bind(this), this.delay);
        }

        Timer.prototype = {
            /**
             * 
             */
            pushBackkey: function pushBackkey(){
                if (this.status === 'running') {
                    this.timeWatied = Date.now();
                    this.status = 'waiting'
                }else 
                {
                    this.run()
                }
            },

            /**
             * Pauses the timer.
             *
             * After calling the 'run' method, it will continue counting.
             *
             * @public
             * @returns {Timer} This object for chaining.
             */
            pause: function pause() {
                if (this.status !== 'waiting') {
                    throw new Error('Can pause only a waiting timer');
                }
                this.status = 'paused';
                this.timePaused = Date.now();
                return this;
            },
            /**
             * Resets the timer to 0 and 'ready' state.
             *
             * @public
             * @returns {Timer} This object for chaining.
             */
            reset: function reset() {
                this.status = 'ready';
                this.count = 0;
                this.startTime = null;
                // reset laps
                this.lapNo = 1;
                this.lastLapTime = 0;
            },

            /**
             * Runs the timer.
             *
             * @public
             * @throws {Error} Throws an error if already stopped.
             * @returns {Timer} This object for chaining.
             */
            run: function run() {
                switch (this.status) {
                case 'ready':
                    if (this.startTime === null) {
                        this.startTime = Date.now();
                    }
                    break;
                case 'paused':
                    // Adjust the startTime by the time passed since the pause
                    // so that the time elapsed remains unchanged.
                    this.startTime += Date.now() - this.timePaused;
                    break;
                case 'running':
                    // already running
                    return this;
                case 'stopped':
                    throw new Error('Can\'t run a stopped timer again');
                }
                this.status = 'running';
                return this;
            },

            /**
             * Stops the timer.
             *
             * SetInterval is cleared, so unlike pause, once you stop timer,
             * you can't run it again.
             *
             * @public
             * @returns {Timer} This object for chaining.
             */
            stop: function stop() {
                clearInterval(this.id);
                this.status = 'stopped';
                this.timePaused = null;
                return this;
            },

            /**
             * Returns elapsed time.
             *
             * @public
             * @returns {number} Time elapsed on the timer.
             */
            getTimeElapsed: function getTimeElapsed() {
                if(this.status === 'waiting')
                {
                    if((Date.now() - this.timeWatied)  > 2000 )// 2second
                    {
                        return -1;
                    }
                    return Date.now() - this.startTime;
                }
                if (this.status === 'running') {
                    return Date.now() - this.startTime;
                }

                if (this.status === 'paused') {
                    return this.timePaused - this.startTime;
                }
                return 0;
            },

            /**
             * Registers new lap.
             * Returns lap instance.
             *
             * @public
             * @returns {Lap} Lap object.
             */
            lap: function lap() {
                var lapObj = new Lap(
                    this.lapNo,
                    // lap time equals total time minus previous lap time
                    this.getTimeElapsed() - this.lastLapTime
                );
                this.lastLapTime = this.getTimeElapsed();
                this.lapNo += 1;
                return lapObj;
            },

            /**
             * Tick handling.
             *
             * Fires all events/callbacks and updates the 'count'
             *
             * @private
             * @returns {Timer} This object for chaining.
             */
            tick: function tick() {
                var i;
                if ((this.status !== 'running')&&(this.status !== 'waiting')) {
                    return this;
                }
                for (i = 0; i < this.callbacks.length; i += 1) {
                    if (typeof this.callbacks[i] === 'string') {
                        e.fire(this.callbacks[i], this);
                    } else if (typeof this.callbacks[i] === 'function') {
                        this.callbacks[i].call(this);
                    }
                }
                this.count += 1;
                return this;
            }
        };

        return {
            Timer: Timer
        };
    }
});
