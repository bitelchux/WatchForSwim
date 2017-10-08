/*
 * log.c
 *
 *  Created on: Oct 7, 2017
 *      Author: craven
 */

#include <stdio.h>
#include <stdarg.h>
#include <storage.h>
#include <dlog.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <time.h>
#include "log.h"

#define LOG_FILE_NAME "watchforswimsensor.log"
static  FILE * fp = NULL;
static int internal_storage_id;

void  log_print( const char *fmt, ...)
{
    if(fp != NULL)
    {
        char buf[512] = {0,};
        va_list ap;
    	time_t t = time(NULL);
    	struct tm tm = *localtime(&t);
    	sprintf(buf,"[%d-%d-%d_%d:%d:%d] ",tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);

		va_start(ap, fmt);
		vsprintf(buf + strlen(buf), fmt, ap);
		va_end(ap);
		int leng = strlen(buf);
		fwrite(buf, leng, 1, fp);
		fflush(fp);

	    dlog_print(DLOG_INFO, LOG_TAG, buf);
    }
}

int log_init(int storage_id)
{
	if(fp != NULL)
		return -1;

    char *path;
    char filename[50] = {0,};
    internal_storage_id = storage_id;
	storage_get_directory(internal_storage_id, STORAGE_DIRECTORY_DOCUMENTS, &path);

	sprintf(filename, "%s/%s",path, LOG_FILE_NAME);

	fp = fopen (filename, "a+");


    free(path);

	return 0;
}

int log_exit(void)
{
	if(fp == NULL)
		return -1;

	fclose(fp);
	fp = NULL;

	return 0;
}


