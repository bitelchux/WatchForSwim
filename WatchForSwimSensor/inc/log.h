/*
 * log.h
 *
 *  Created on: Oct 7, 2017
 *      Author: craven
 */

#ifndef LOG_H_
#define LOG_H_


void  log_print( const char *format, ...);
int log_init(int storage_id);
int log_exit(void);


#endif /* LOG_H_ */
