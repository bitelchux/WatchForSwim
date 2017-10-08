
/*global define*/

/**
 * Log model module.
 *
 * @module models/log
 * @requires {@link core/event}
 * @namespace models/log
 */

define({
    name: 'models/log',
    requires: [
        'core/event'
    ],
    def: function log() {
        'use strict';
      
        var initialised = false;
        var filestream = null;
        
        function onOpenSuccess(fs) {
        	filestream = fs;
        }
        
        function print(str) {
        	if(filestream !== null){
        		var current_dt = tizen.time.getCurrentDateTime();
        		var str1 = "[" + current_dt.toLocaleTimeString() + "] : " + str +"\n";
        		filestream.write(str1);
        	}
		}
        
        function init() {
            if (initialised) {
                return false;
            }
            
            var file;
            var logfile = "watchforswim.log";
            // Resolves helloWorld.doc file that is located in the
            // documents root location
            tizen.filesystem.resolve(
				'documents',
				function(dir) { 
					try {
						file = dir.resolve(logfile);
					} catch (e) {
						file = dir.createFile(logfile);
					}
					if (file !== null) {
						file.openStream('a', onOpenSuccess, null, 'UTF-8');
					}},
				function(e) { console.log("Error" + e.message); },
				"rw");
            // initialization status
            initialised = true;
            console.log('log: init()');
            
            return true;
        }
        
        
        return{
            init: init,
            print: print,
        };
    }
});