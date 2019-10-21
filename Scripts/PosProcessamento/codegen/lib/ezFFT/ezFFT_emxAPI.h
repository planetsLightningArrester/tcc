/*
 * File: ezFFT_emxAPI.h
 *
 * MATLAB Coder version            : 4.0
 * C/C++ source code generated on  : 20-Oct-2019 13:31:30
 */

#ifndef EZFFT_EMXAPI_H
#define EZFFT_EMXAPI_H

/* Include Files */
#include <stddef.h>
#include <stdlib.h>
#include "rtwtypes.h"
#include "ezFFT_types.h"

/* Function Declarations */
extern emxArray_real_T *emxCreateND_real_T(int numDimensions, int *size);
extern emxArray_real_T *emxCreateWrapperND_real_T(double *data, int
  numDimensions, int *size);
extern emxArray_real_T *emxCreateWrapper_real_T(double *data, int rows, int cols);
extern emxArray_real_T *emxCreate_real_T(int rows, int cols);
extern void emxDestroyArray_real_T(emxArray_real_T *emxArray);
extern void emxInitArray_real_T(emxArray_real_T **pEmxArray, int numDimensions);

#endif

/*
 * File trailer for ezFFT_emxAPI.h
 *
 * [EOF]
 */
