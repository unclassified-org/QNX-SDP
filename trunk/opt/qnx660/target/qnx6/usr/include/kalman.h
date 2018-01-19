/*
 * $QNXLicenseC:
 * Copyright 2010, QNX Software Systems.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You
 * may not reproduce, modify or distribute this software except in
 * compliance with the License. You may obtain a copy of the License
 * at: http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OF ANY KIND, either express or implied.
 *
 * This file may contain contributions from others, either as
 * contributors under the License or as licensors under other terms.
 * Please review this entire file for other proprietary rights or license
 * notices, as well as the QNX Development Suite License Guide at
 * http://licensing.qnx.com/license-guide/ for other information.
 * $
 */
#ifndef KALMAN_H_
#define KALMAN_H_

/*
 * This file implements a standard Kalman filter aimed at
 * correcting noisy data expressed in 2D Cartesian coordinates.
 *
 * The (2D) state model (x) is defined by the following:
 *
 * x = [x_position y_position x_speed y_speed];
 *
 * Assuming the following model:
 *
 * x(k) = x(k-1) + x'(k-1)*delta_t + 1/2*x''(k-1)*delta_t^2
 * x'(k) = x'(k-1) + x''(k-1)*delta_t
 *
 * We assume a linear model, hence the  state transition matrix A
 * is of the following form:
 *
 * A = | 1     0     delta_t 0      |
 *     | 0     1     0       delta t|
 *     | 0     0     1       0      |
 *     | 0     0     0       1      |
 *
 * For optimization purposes, dt is considered unitary.
 *
 * This yields:
 * A = | 1     0     1     0 |
 *     | 0     1     0     1 |
 *     | 0     0     1     0 |
 *     | 0     0     0     1 |
 *
 * with transpose:
 *
 * A_t = | 1     0     0     0 |
 *       | 0     1     0     0 |
 *       | 1     0     1     0 |
 *       | 0     1     0     1 |
 *
 * The observation matrix "H" allows to relate the state to the
 * observation domain:
 *
 * H = | 1 0 0 0 |
 *     | 0 1 0 0 |
 *
 * with transpose:
 *
 * H_t = | 1    0 |
 *       | 0    1 |
 *       | 0    0 |
 *       | 0    0 |
 *
 * The process noise covariance matrix defines the unmodeled
 * dynamics of the system. Since we assume a multivariable
 * linear system as per defined by A, the process noise is defined
 * as the unmodeled acceleration in the system.
 *
 * Q = | a_x*dt^2/4      0         a_x*dt/2     0     |
 *     |    0         a_y*dt^2/4      0      a_y*dt/2 |
 *     |   a_x*dt        0           a_x        0     |
 *     |    0         a_y_dt/2        0        a_y    |
 *
 * with a_x, a_y: acceleration variances by dimension;
 *
 * Assuming a unit delta_t this reduces to:
 *
 * Q = | a_x/4     0        a_x/2      0     |
 *     |   0      a_y/4      0       a_y/2   |
 *     | a_x/2     0        a_x        0     |
 *     |   0      a_y/2      0        a_y    |
 *
 * The measurement noise is considered uncorrelated, hence the
 * measurement noise covariance matrix is of the form:
 *
 * R = | m_x 0   |
 *     | 0   m_y |
 *
 * where m_x, m_y: measurement noise variances by dimension.
 */

/**
 * Kalman filter, double precision.
 * x_pos: x position measurement;
 * y_pos: y position measurement;
 * x_post: a posteriori state estimate - 4x1 matrix;
 * p_post: a posteriori error covariance - 4x4 matrix;
 * q_var_x : process noise variance for x coordinate;
 * q_var_y : process noise variance for y coordinate;
 * r_var_x : measurement noise variance for x coordinate;
 * r_var_y : measurement noise variance for y coordinate;
 */
int kalman_d(double x_pos, double y_pos, double * x_post, double * p_post, double q_var_x, double q_var_y, double r_var_x, double r_var_y);

#endif /* KALMAN_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/kalman/public/kalman.h $ $Rev: 680336 $")
#endif
