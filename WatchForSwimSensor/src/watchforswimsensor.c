#include <tizen.h>
#include <service_app.h>
#include "watchforswimsensor.h"
#include <sensor.h>
#include <stdio.h>
#include <string.h>
#include <message_port.h>
#include <stdint.h>
#include <storage.h>
#include <stdlib.h>
#include <stdbool.h>
#include <dlog.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <time.h>
#include <Ecore.h>

#include "log.h"

struct __attribute__((packed))  sensorData{
	int8_t type;
	float x;
	float y;
	float z;
	int accuracy;
	unsigned long long timestamp;
};



static	sensor_listener_h h_listener_acc;
static	sensor_listener_h h_listener_gyr;

static sensor_h h_sensor_acc;
static sensor_h h_sensor_gyr;

static int internal_storage_id;
static char dir_path[50] = {0,};
static  FILE * fp;


bool service_app_create(void *data)
{
    // Todo: add your code here.
	log_print("call [%s]\n", __FUNCTION__);
    return true;
}

void service_app_terminate(void *data)
{
    // Todo: add your code here.
	log_print("call [%s]\n", __FUNCTION__);

    return;
}

void service_app_control(app_control_h app_control, void *data)
{
    // Todo: add your code here.
	log_print("call [%s]\n", __FUNCTION__);
    return;
}

static void
service_app_lang_changed(app_event_info_h event_info, void *user_data)
{
	/*APP_EVENT_LANGUAGE_CHANGED*/
	log_print("call [%s]\n", __FUNCTION__);
	return;
}

static void
service_app_region_changed(app_event_info_h event_info, void *user_data)
{
	/*APP_EVENT_REGION_FORMAT_CHANGED*/
	log_print("call [%s]\n", __FUNCTION__);
}

static void
service_app_low_battery(app_event_info_h event_info, void *user_data)
{
	/*APP_EVENT_LOW_BATTERY*/
	log_print("call [%s]\n", __FUNCTION__);
}

static void
service_app_low_memory(app_event_info_h event_info, void *user_data)
{
	/*APP_EVENT_LOW_MEMORY*/
	log_print("call [%s]\n", __FUNCTION__);
}

void
example_sensor_callback(sensor_h sensor, sensor_event_s *event, void *user_data)
{
    /*
       If a callback is used to listen for different sensor types,
       it can check the sensor type
    */
    sensor_type_e type;
    sensor_get_type(sensor, &type);

    struct sensorData data = {
    		.type = (int8_t)type,
    		.x = event->values[0],
    		.y = event->values[1],
    		.z = event->values[2],
			.timestamp = event->timestamp,
			.accuracy = event->accuracy
    };

    fwrite( &data, sizeof(data), 1, fp);

#if 0
    if (type == SENSOR_LINEAR_ACCELERATION) {
        unsigned long long timestamp = event->timestamp;
        int accuracy = event->accuracy;
        float x = event->values[0];
        float y = event->values[1];
        float z = event->values[2];
		//log_print("ACC x [%f]u y[%f] z[%f]\n", x, y, z);


    }else if(type == SENSOR_GYROSCOPE) {
        unsigned long long timestamp = event->timestamp;
        int accuracy = event->accuracy;
        float x = event->values[0];
        float y = event->values[1];
        float z = event->values[2];

		//log_print("GYR x [%f]u y[%f] z[%f]\n", x, y, z);
    }
#endif
}


void
message_port_cb(int local_port_id, const char *remote_app_id, const char *remote_port,
                bool trusted_remote_port, bundle *message, void *user_data)
{
    char *command = NULL;
    char *data = NULL;
    bundle_get_str(message, "command", &command);
    bundle_get_str(message, "data", &data);


    /* Convert to local time format. */

    log_print("Message from %s, command: %s data: %s\n", remote_app_id, command, data);

    if(strncmp(command, "start", 5) ==0 )
    {
    	char filename[100];
    	time_t t = time(NULL);
    	struct tm tm = *localtime(&t);
    	sprintf(filename,"%s/%d-%d-%d_%d:%d:%d",dir_path,tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);
    	if(fp == NULL)
    		fp = fopen (filename, "w+");
    	sensor_listener_start(h_listener_acc);
    	sensor_listener_start(h_listener_gyr);
        log_print("Start Sensor Logging\n");
    }else if(strncmp(command, "stop", 4) ==0 )
    {
    	sensor_listener_stop(h_listener_acc);
    	sensor_listener_stop(h_listener_gyr);
        log_print("Stop Sensor Logging\n");
        fclose(fp);
        fp = NULL;
    }
}

static bool
storage_cb(int storage_id, storage_type_e type, storage_state_e state,
           const char *path, void *user_data)
{

	log_init(storage_id);
    if (type == STORAGE_TYPE_INTERNAL) {
        char *path;
        internal_storage_id = storage_id;
        DIR *dirptr;

    	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &path);

    	sprintf(dir_path, "%s/watchforswim", path);

        if (access ( dir_path, F_OK ) != -1 ) {
            // file exists
            if ((dirptr = opendir (dir_path)) != NULL) {
                closedir (dirptr);
                log_print("%s exists \n", dir_path);
            } else {
            	log_print("%s exists, but not dir\n", dir_path);
            }
        } else {
            log_print("%s mkdir \n", dir_path);
            mkdir(dir_path, 0777);
        }

        log_print("stroage_path: [%s]\n", dir_path);

        free(path);
        return false;
    }

    return true;
}


/**
 * SENSOR_ACCELEROMETER
 * SENSOR_GRAVITY
 * SENSOR_LINEAR_ACCELERATION
 * SENSOR_GYROSCOPE
 * SENSOR_LIGHT
 * SENSOR_PRESSURE
 * SENSOR_HRM
 * SENSOR_HRM_LED_GREEN
 * SENSOR_GYROSCOPE_UNCALIBRATED
 *
 * SENSOR_MAGNETIC doesn't support
 * SENSOR_ROTATION_VECTOR doesn't support
 * SENSOR_ORIENTATION doesn't support
 * SENSOR_PROXIMITY doesn't support
 * SENSOR_ULTRAVIOLET doesn't support
 * SENSOR_TEMPERATURE doesn't support
 * SENSOR_HUMIDITY doesn't support
 * SENSOR_HRM_LED_IR doesn't support
 * SENSOR_HRM_LED_RED  doesn't support
 * SENSOR_GEOMAGNETIC_UNCALIBRATED doesn't support
 * SENSOR_GYROSCOPE_ROTATION_VECTOR doesn't support
 * SENSOR_GEOMAGNETIC_ROTATION_VECTOR doesn't support
 */
int main(int argc, char* argv[])
{
    char ad[50] = {0,};

	service_app_lifecycle_callback_s event_callback;
	app_event_handler_h handlers[5] = {NULL, };
	bool supported = false;

	event_callback.create = service_app_create;
	event_callback.terminate = service_app_terminate;
	event_callback.app_control = service_app_control;

	dlog_print(DLOG_ERROR, LOG_TAG, "Application Main start\n");

	service_app_add_event_handler(&handlers[APP_EVENT_LOW_BATTERY], APP_EVENT_LOW_BATTERY, service_app_low_battery, &ad);
	service_app_add_event_handler(&handlers[APP_EVENT_LOW_MEMORY], APP_EVENT_LOW_MEMORY, service_app_low_memory, &ad);
	service_app_add_event_handler(&handlers[APP_EVENT_LANGUAGE_CHANGED], APP_EVENT_LANGUAGE_CHANGED, service_app_lang_changed, &ad);
	service_app_add_event_handler(&handlers[APP_EVENT_REGION_FORMAT_CHANGED], APP_EVENT_REGION_FORMAT_CHANGED, service_app_region_changed, &ad);

	dlog_print(DLOG_ERROR, LOG_TAG, "%s", __func__);

	for (int i = SENSOR_ACCELEROMETER; i< SENSOR_LAST; i++)
	{
		sensor_is_supported(i, &supported);
		if (!supported) {
		    /* Accelerometer is not supported on the current device */
			dlog_print(DLOG_ERROR, LOG_TAG, "%d doesn't support", i);
		}
	}


	sensor_get_default_sensor(SENSOR_LINEAR_ACCELERATION, &h_sensor_acc);
	sensor_get_default_sensor(SENSOR_GYROSCOPE, &h_sensor_gyr);

	sensor_create_listener(h_sensor_acc, &h_listener_acc);
	sensor_listener_set_option(h_listener_acc, SENSOR_OPTION_ALWAYS_ON);
	sensor_listener_set_event_cb(h_listener_acc, 100, example_sensor_callback, NULL);

	sensor_create_listener(h_sensor_gyr, &h_listener_gyr);
	sensor_listener_set_option(h_listener_gyr, SENSOR_OPTION_ALWAYS_ON);
	sensor_listener_set_event_cb(h_listener_gyr, 100, example_sensor_callback, NULL);



	int port_id = message_port_register_local_port("sensorService", message_port_cb, NULL);
	if (port_id < 0)
		dlog_print(DLOG_ERROR, LOG_TAG, "Port register error: %d", port_id);
	else
		dlog_print(DLOG_ERROR, LOG_TAG, "port_id: %d", port_id);

	int error;
	error = storage_foreach_device_supported(storage_cb, NULL);

	return service_app_main(argc, argv, &event_callback, ad);
}
