/*
 * File: ezFFT.h
 *
 * MATLAB Coder version            : 4.0
 * C/C++ source code generated on  : 20-Oct-2019 13:31:30
 */

#ifndef EZFFT_H
#define EZFFT_H

/* Include Files */
#include <stddef.h>
#include <stdlib.h>
#include "rtwtypes.h"
#include "ezFFT_types.h"

/* Function Declarations */
extern void ezFFT(const emxArray_real_T *b_signal, double fs, emxArray_real_T
                  *frequencyAxis, emxArray_real_T *amplitudeAxis,
                  emxArray_real_T *phaseAxis, emxArray_real_T *powerSpectrumAxis);

#endif

/*
 * File trailer for ezFFT.h
 *
 * [EOF]
 */
