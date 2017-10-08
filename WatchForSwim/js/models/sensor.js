/*global define*/

/**
 * Sensor model module.
 *
 * @module models/sensor
 * @requires {@link core/event}
 * @namespace models/sensor
 */

define({
    name: 'models/sensor',
    requires: [
        'core/event',
    ],
    

    def: function sensorService() {
        'use strict';
       

        var SERVICE_APP_ID = '1MtX1ZbvQT.watchforswimsensor', // 'org.example.watchforswimsensor', //'1MtX1ZbvQT.watchforswimsensor',

        SERVICE_PORT_NAME = 'sensorService',
        /**
         * Local message port name.
         *
         * @const {string}
         */
        LOCAL_MESSAGE_PORT_NAME = 'SAMPLE_PORT_REPLY',

        /**
         * Local message port object.
         *
         * @type {LocalMessagePort}
         */
        localMessagePort = null,

        /**
         * Remote message port object.
         *
         * @type {RemoteMessagePort}
         */
        remoteMessagePort = null,

        /**
         * Local message port listener id that can be used later
         * to remove the listener.
         *
         * @type {number}
         */
        localMessagePortWatchId = null,

        /**
         * Indicates whether the message port is during start-up.
         *
         * @type {boolean}
         */
        isStarting = false,

        
        initialised = false;
        
        

        /**
         * Sends message to another application.
         *
         * @param {string} command
         */
        function sendCommand(command) {
            try {
                remoteMessagePort.sendMessage([{
                    key: 'command',
                    value: command
                }],
                    localMessagePort);
            } catch (error) {
                console.error(error);
            }
        }

        /**
         * Performs action after receiving message from another application.
         *
         * @param {MessagePortDataItem[]} data
         */
        function onReceive(data) {
            var message = null,
                i = 0,
                len = data.length;

            for (i = 0; i < len; i += 1) {
                if (data[i].key === 'server') {
                    message = data[i].value;
                }
            }

            if (message === 'WELCOME') {
                sendCommand('start');
            } else if (message === 'stopped') {
                sendCommand('exit');
            } else if (message === 'exit') {
                if (remoteMessagePort) {
                    remoteMessagePort = null;
                }
                if (localMessagePort) {
                    try {
                        localMessagePort
                            .removeMessagePortListener(localMessagePortWatchId);
                        localMessagePort = null;
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }

        /**
         * Initializes message port.
         */
        function startMessagePort() {
            try {
                localMessagePort = tizen.messageport.requestLocalMessagePort(LOCAL_MESSAGE_PORT_NAME);
                localMessagePortWatchId = localMessagePort.addMessagePortListener(function onDataReceive(data, remote) {
                        onReceive(data, remote);
                    });
            } catch (e) {
                localMessagePort = null;
                console.error(e);
            }

            try {
                remoteMessagePort = tizen.messageport.requestRemoteMessagePort(SERVICE_APP_ID, SERVICE_PORT_NAME);
            } catch (ex) {
                remoteMessagePort = null;
                console.error(ex);
            }

            isStarting = false;

            sendCommand('connect');
        }

        function loggingStart() {

            sendCommand('start');
		}
        
        function loggingStop() {

            sendCommand('stop');
		}
        /**
         * Performs action when getAppsContext method of tizen.application API
         * results in error.
         *
         * @param {Error} err
         */
        function onGetAppsContextError(err) {
            console.error('getAppsContext exc', err);
        }

        /**
         * Performs action on a list of application contexts
         * for applications that are currently running on a device.
         *
         * @param {ApplicationContext[]} contexts
         */
        function onGetAppsContextSuccess(contexts) {
            var i = 0,
                len = contexts.length,
                appInfo = null;

            for (i = 0; i < len; i = i + 1) {
                try {
                    appInfo = tizen.application.getAppInfo(contexts[i].appId);
                } catch (exc) {
                    console.error('Exception while getting application info: ' + exc.message);
                }

                if (appInfo.id === SERVICE_APP_ID) {
                    break;
                }
            }
            console.log("onGetAppsContextSuccess " + appInfo.id);
            if (i >= len) {
                launchServiceApp();
            } else {
                startMessagePort();
            }
        }

        /**
         * Starts obtaining information about applications
         * that are currently running on a device.
         */
        function start() {
            try {
                tizen.application.getAppsContext(onGetAppsContextSuccess,onGetAppsContextError);
            } catch (e) {
            	console.error('Get AppContext Error: ' + e.message);
            }
        }

        function onSuccess() {
            start();
        }

        function onError(err) {
            console.error('Service Applaunch failed', err);
            isStarting = false;
        }
        /**
         * Launches hybrid service application.
         */
        function launchServiceApp() {


            try {
                tizen.application.launch(SERVICE_APP_ID, onSuccess, onError);
            } catch (exc) {
                console.error('Exception while launching HybridServiceApp: ' + exc.message);
            }
        }

        
        function init() {
            if (initialised) {
                return false;
            }
            
            launchServiceApp();
            
            
            // initialization status
            initialised = true;
            
            return true;
        }
        
        
        return{
            init: init,
            loggingStart: loggingStart,
            loggingStop: loggingStop
        };
    }
});
