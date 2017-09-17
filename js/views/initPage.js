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

/*global define, window, document*/

/**
 * Init page module.
 *
 * @module views/initPage
 * @requires {@link core/event}
 * @requires {@link core/template}
 * @requires {@link core/application}
 * @requires {@link views/stopWatchPage}
 * @requires {@link core/systeminfo}
 * @namespace views/initPage
 */
define({
    name: 'views/initPage',
    requires: [
        'core/event',
        'core/template',
        'core/application',
        'views/stopWatchPage',
        'core/systeminfo'
    ],
    def: function viewsInitPage(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @memberof views/initPage
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Application module object.
             *
             * @memberof views/initPage
             * @private
             * @type {Module}
             */
            app = req.core.application,

            /**
             * System info module object.
             *
             * @memberof views/initPage
             * @private
             * @type {Module}
             */
            sysInfo = req.core.systeminfo;

        /**
         * Handles tizenhwkey event.
         *
         * @memberof views/initPage
         * @private
         * @param {Event} ev
         */
        function onHardwareKeysTap(ev) {
            if (ev.keyName === 'back') {
                if (document.querySelector('#lap-list-page.visible')) {
                    // hide lap list if visible
                    req.views.stopWatchPage.hideLapList();
                } else {
                    req.views.stopWatchPage.pushBackkey()
                }
            }
        }

        /**
         * Handles core.systeminfo.battery.low event.
         *
         * Application policy implies its close in such case.
         *
         * @memberof views/initPage
         * @private
         */
        function onLowBattery() {
            app.exit();
        }

        /**
         * Handles keydown event on document element.
         *
         * @memberof views/initPage
         * @private
         * @param {Event} ev
         */
        function onKeyDown(ev) {
            if (ev.keyIdentifier.indexOf('Power') !== -1) {
                e.fire('device.powerOff');
            }
        }

        /**
         * Registers events.
         *
         * @memberof views/initPage
         * @private
         */
        function bindEvents() {
            document.addEventListener('keydown', onKeyDown);
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            sysInfo.listenBatteryLowState();
        }

        /**
         * Initializes module.
         *
         * @memberof views/initPage
         * @public
         */
        function init() {
            bindEvents();
            sysInfo.checkBatteryLowState();
        }

        e.listeners({
            'core.systeminfo.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }

});
