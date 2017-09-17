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

/*global navigator, tau, document, define, setTimeout*/

/**
 * StopWatch page module.
 *
 * @module views/stopWatchPage
 * @requires {@link core/event}
 * @requires {@link models/timer}
 * @requires {@link core/template}
 * @requires {@link helpers/timer}
 * @namespace views/stopWatchPage
 */
define({
    name: 'views/stopWatchPage',
    requires: [
        'core/event',
        'models/timer',
        'core/template',
        'helpers/timer'
    ],
    def: function viewsStopWatchPage(req) {
        'use strict';

        /**
         * Core event module.
         *
         * @memberof views/stopWatchPage
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Core template module.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {Module}
             */
            tpl = req.core.template,

            /**
             * Timer model object.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {Timer}
             */
            Timer = req.models.timer.Timer,

            /**
             * Time helper object.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {Time}
             */
            Time = req.helpers.timer.Time,

            /**
             * Progress bar start angle in radians.
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            INDICATOR_START_ANGLE = -Math.PI / 2,

            /**
             * Device height.
             * Used for swipe.
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            DEVICE_HEIGHT = 360,

            /**
             * Indicator vibration duration (ms).
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            VIBRATION_DURATION = 100,

            /**
             * Indicator restore timeout (ms).
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            INDICATOR_RESTORE_TIMEOUT = 500,

            /**
             * Cue indicator restore timeout (ms).
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            CUE_RESTORE_TIMEOUT = 1500,

            /**
             * Laps page hide timeout (ms).
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            LAP_LIST_HIDE_TIMEOUT = 1000,

            /**
             * Laps page header height.
             *
             * @memberof views/stopWatchPage
             * @private
             * @const {number}
             */
            BOTTOM_SWIPE_AREA_HEIGHT = 70,

            /**
             * Laps list element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            stopLapListEl = null,

            /**
             * Timer model module.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {Timer}
             */
            timer = null,

            /**
             * Initialization flag.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {boolean}
             */
            initialised = false,

            /**
             * Canvas context.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {CanvasContext}
             */
            roundProgressCanvasContext = null,

            /**
             * Laps list page id attribute.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {string}
             */
            pageId = 'stopwatch-page',

            /**
             * Main page element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            stopWatchPage = document.getElementById(pageId),

            /**
             * Total time element (seconds).
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            totalProgress =
                stopWatchPage.getElementsByClassName('total-progress')[0],

            /**
             * Lap time element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            lapProgress =
                stopWatchPage.getElementsByClassName('lap-progress')[0],

            /**
             * Laps count element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            lapCount = stopWatchPage.getElementsByClassName('lap-count')[0],

            /**
             * Cue indicator element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            cueIndicator =
                stopWatchPage.querySelector('.progress-indicator.cue'),

            /**
             * Total time element (minutes).
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            roundProgressCanvas = document.getElementById('path-canvas'),

            /**
             * Laps list page element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            lapListPage =
                document.querySelector('#lap-list-page'),

            /**
             * Laps count element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            lapCounterElement =
                lapListPage.querySelector('.lap-counter'),

            /**
             * Lap time element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            timeCounterElement =
                lapListPage.querySelector('.time-counter'),

            /**
             * Laps list element.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLElement}
             */
            stopContentListLapEl =
                document.getElementById('stopwatch-content-lap-list'),

            /**
             * Draggable elements.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLCollection}
             */
            dragElements = lapListPage.querySelectorAll('[data-draggable]'),

            /**
             * Current lap holder.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {Lap}
             */
            currentLap = null,

            /**
             * Digit elements.
             *
             * @memberof views/stopWatchPage
             * @private
             * @type {HTMLCollection}
             */
            digits = document.querySelectorAll('.digit[id]');

        /**
         * Show the stopwatch page.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function show() {
            tau.changePage(stopWatchPage);
        }

        /**
         * Show buttons.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {string} status Status can be ready, paused, running.
         */
        function showButtons(status) {
            var buttons = document.getElementsByClassName('stopwatch-btn'),
                buttonsElementsCount = buttons.length - 1,
                i = 0;

            status = status || timer.status;

            for (i = buttonsElementsCount; i >= 0; i -= 1) {
                buttons[i].classList.add('hidden');
            }

            buttons = document.getElementsByClassName('stopwatch-' + status);
            buttonsElementsCount = buttons.length - 1;
            for (i = buttonsElementsCount; i >= 0; i -= 1) {
                buttons[i].classList.remove('hidden');
            }
        }

        /**
         * Repaints progress bar.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {number} ts Total time in milliseconds.
         */
        function redrawCanvas(ts) {
            roundProgressCanvasContext.clearRect(0, 0, 360, 360);
            roundProgressCanvasContext.beginPath();
            roundProgressCanvasContext.arc(
                180,
                180,
                180,
                INDICATOR_START_ANGLE,
                INDICATOR_START_ANGLE +
                    (ts / 1000 / 60 * Math.PI * 2 / 10) % (Math.PI * 2)
            );
            roundProgressCanvasContext.stroke();
        }

        /**
         * Updates header on lap list page.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {number} lapNumber
         */
        function updateLapListHeader(lapNumber) {
            var sufix = (lapNumber > 1) ? 's' : '',
                time = new Time(timer.getTimeElapsed()),
                timeString = time[0] + time[1] + ':' + time[2] + time[3] +
                    '.' + time[4] + time[5];

            lapCounterElement.innerText = lapNumber + ' Lap' + sufix;
            timeCounterElement.innerText = timeString;
        }

        /**
         * Refresh timer.
         *
         * @memberof views/stopWatchPage
         * @private
         * @returns {Time} Time instance.
         */
        function refreshTimer() {

            /**
             * Total time in miliseconds.
             *
             * @type {number}
             */
            var elapsedTimestamp = timer.getTimeElapsed();
            if(elapsedTimestamp < 0)
            {
                timer.run();
                showButtons();
                elapsedTimestamp = timer.getTimeElapsed();
            }

            /**
             * Lap time in miliseconds.
             *
             * @type {number}
             */
            var lastLapTimestamp = timer.lastLapTime,

                /**
                 * Time instance.
                 *
                 * @type {Time}
                 */
                time = new Time(elapsedTimestamp),

                /**
                 * Length of Array of digits.
                 */
                i =  time.length - 1;

            for (i; i >= 0; i -= 1) {
                digits[i].innerText = time[i];
            }

            totalProgress.style.webkitTransform =
                'rotateZ(' + elapsedTimestamp / 1000 / 15 / 2 * Math.PI +
                'rad)';
            lapProgress.style.webkitTransform =
                'rotateZ(' + (elapsedTimestamp - lastLapTimestamp) /
                1000 / 15 / 2 * Math.PI + 'rad)';

            redrawCanvas(elapsedTimestamp);

            timeCounterElement = timeCounterElement ||
                document.querySelector('#lap-list-page .time-counter');

            if (stopContentListLapEl.classList.contains('ui-page-active')) {
                timeCounterElement.innerText = elapsedTimestamp;
            }

            if (currentLap) {
                updateLapListHeader(currentLap.no);
            }

            return time;
        }

        /**
         * Restores indicator.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function restoreIndicator() {
            /* jshint validthis: true */
            this.classList.remove('active');
        }

        /**
         * Triggers indicator for desired time.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function triggerIndicator() {
            /* jshint validthis: true */
            var indicatorClass = '.' +
                this.getAttribute('indicator') + '-indicator',
                indicatorElement =
                document.querySelector(indicatorClass);

            indicatorElement.classList.add('active');
            if (navigator.hasOwnProperty('vibrate')) {
                navigator.vibrate(VIBRATION_DURATION);
            }
            setTimeout(
                restoreIndicator.bind(indicatorElement),
                INDICATOR_RESTORE_TIMEOUT
            );
        }

        /**
         * Binds indicator trigger on click.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function bindIndicator() {
            /* jshint validthis: true */
            this.addEventListener('click', triggerIndicator);
        }

        /**
         * Start the timer.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {Event} ev
         */
        function start(ev) {
            ev.preventDefault();
            timer.run();
            showButtons();
        }


        /**
         * Start the timer.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {Event} ev
         */
        function pushBackkey(ev) {
            timer.pushBackkey();
            showButtons();
        }

        /**
         * Resets Stopwatch.
         * Sets default texts.
         * Works when the timer is stopped (paused).
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function reset() {
            timer.reset();
            currentLap = null;
            document.getElementById('stopwatch-lap-list').innerHTML = '';
            lapCount.innerText = '';
            refreshTimer();
            showButtons();
            lapCount.classList.remove('visible');
            lapCounterElement.innerHTML = '0 Laps';
        }

        /**
         * Update laps timers.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function lap() {
            var html,
                newItem = null,
                currentLapLeadingZero = 0;

            currentLap = timer.lap();
            currentLapLeadingZero =
                currentLap.no > 9 ? currentLap.no : '0' + currentLap.no;

            stopLapListEl =
                stopLapListEl || document.getElementById('stopwatch-lap-list');

            updateLapListHeader(currentLap.no);

            html = tpl.get('lapRow', {
                no: currentLapLeadingZero,
                totalTime: new Time(timer.getTimeElapsed()),
                lapTime: new Time(currentLap.time)
            });

            newItem = document.createElement('li');
            newItem.innerHTML = html;

            if (stopLapListEl.firstChild) {
                stopLapListEl.insertBefore(
                    newItem,
                    stopLapListEl.firstChild
                );
            } else {
                stopLapListEl.appendChild(newItem);
            }

            lapCount.innerText = currentLapLeadingZero;
            lapCount.classList[currentLap ? 'add' : 'remove']('visible');
            cueIndicator.classList.add('animate');

            setTimeout(function removeClass() {
                cueIndicator.classList.remove('animate');
            }, CUE_RESTORE_TIMEOUT);
        }

        /**
         * Stop actually pauses the timer.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {Event} e
         */
        function stop(e) {
            e.preventDefault();
            timer.pause();
            refreshTimer();
            showButtons();
        }

        /**
         * Restores main page zoom.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function restoreZoom() {
            stopWatchPage.classList.remove('zoom-out');
            lapListPage.classList.remove('visible');
        }

        /**
         * Shows laps page.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function showLapList() {
            if (!currentLap) {
                return;
            }
            stopWatchPage.classList.add('zoom-out');
            tau.changePage('#lap-list-page');
            lapListPage.classList.add('visible');
        }

        /**
         * Hides laps page.
         *
         * @memberof views/stopWatchPage
         * @public
         */
        function hideLapList() {
            lapListPage.classList.remove('visible');
            lapListPage.style.webkitTransform =
                'translateY(0)';
        }

        /**
         * Swipes laps page.
         *
         * @memberof views/stopWatchPage
         * @private
         * @param {Event} event
         */
        function moveLapList(event) {
            var touchY = 0,
                translateY = 0;

            if (!currentLap) {
                return;
            }

            event.stopPropagation();
            event.preventDefault();

            if (event.type === 'touchmove') {
                touchY = event.touches[0].clientY;
                translateY = -DEVICE_HEIGHT + touchY;
            } else {
                try {
                    touchY = -parseInt(
                        lapListPage.style.webkitTransform.match(/\d+/g)[0],
                        10
                    );
                } catch (ignore) {}

                if (touchY > -DEVICE_HEIGHT / 2) {
                    translateY = 0;
                    restoreZoom();
                    if (!event.touches.length) {
                        setTimeout(hideLapList, LAP_LIST_HIDE_TIMEOUT);
                    }
                } else {
                    translateY = -DEVICE_HEIGHT + BOTTOM_SWIPE_AREA_HEIGHT;
                }
            }

            lapListPage.style.webkitTransform =
                'translateY(' +
                    Math.min(0,
                        Math.max(
                            -DEVICE_HEIGHT + BOTTOM_SWIPE_AREA_HEIGHT,
                            translateY
                        )
                    ) + 'px)';
        }

        /**
         * Binds events to all interactive elements in application.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function bindEvents() {
            // start (when zeroed, ready to run)
            document.getElementById('stopwatch-start-btn').addEventListener(
                'click',
                start
            );

            // stop, lap (when running)
            document.getElementById('stopwatch-stop-btn').addEventListener(
                'click',
                stop
            );

            // document.getElementById('stopwatch-lap-btn').addEventListener(
            //     'click',
            //     lap
            // );

            // restart, reset (when stopped, ie. paused)
            document.getElementById('stopwatch-restart-btn').addEventListener(
                'click',
                start
            );

            // reset stopwatch
            document.getElementById('stopwatch-reset-btn').addEventListener(
                'click',
                reset
            );

            // Binding indicators to all buttons.
            Array.prototype.slice.apply(
                document.querySelectorAll('.main-control button')
            ).map(function bindButton(element) {
                bindIndicator.call(element);
            });

            // show laps list
            document.querySelector('#lap-list-page').addEventListener(
                'click',
                showLapList
            );

            // restore zoom.
            document.getElementById('stopwatch-content-timer')
                .addEventListener('click', restoreZoom);

            // Binds touch events to specified elements.
            Array.prototype.slice.apply(dragElements)
                .map(function bindEvents(elem) {
                    elem.addEventListener('touchstart', showLapList, true);
                    elem.addEventListener('touchmove', moveLapList, true);
                    elem.addEventListener('touchend', moveLapList, true);
                });

            e.listeners({
                'views.stopWatchPage.show': show
            });

        }

        /**
         * Initializes and sets up the canvas.
         *
         * @memberof views/stopWatchPage
         * @private
         */
        function initCanvas() {
            roundProgressCanvasContext = roundProgressCanvas.getContext('2d');
            roundProgressCanvasContext.strokeStyle = 'rgb(18, 181, 255)';
            roundProgressCanvasContext.lineWidth = 180;
        }

        /**
         * Initializes the stopwatch - timer and events.
         * Returns true if any action was performed, false otherwise.
         *
         * @memberof views/stopWatchPage
         * @public
         * @returns {boolean}
         */
        function init() {
            if (initialised) {
                return false;
            }

            /**
             * Bind tick event listener.
             */
            e.listeners({
                'models.timer.tick': refreshTimer
            });

            // init model
            timer = new Timer(10, 'tick');

            // set up canvas element
            initCanvas();

            // init UI by binding events
            bindEvents();

            // initialization status
            initialised = true;
            return true;
        }

        return {
            init: init,
            hideLapList: hideLapList,
            pushBackkey: pushBackkey
        };

    }
});
