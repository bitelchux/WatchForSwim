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

/**
 * Config module
 * @namespace core/config
 * @memberof core
 */

define({
    name: 'core/config',
    def: function config() {
        'use strict';

        var properties = {
            'templateDir': 'templates',
            'templateExtension': '.tpl'
        };

        /**
         * Gets value from configuration.
         * If configuration value doesn’t exists return default value.
         * @memberof core/config
         * @param {string} value
         * @param {string} defaultValue
         */
        function get(value, defaultValue) {
            if (properties[value] !== undefined) {
                return properties[value];
            }
            return defaultValue;
        }

        return {
            get: get
        };

    }
});
