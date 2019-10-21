/*
 * File: _coder_ezFFT_api.h
 *
 * MATLAB Coder version            : 4.0
 * C/C++ source code generated on  : 20-Oct-2019 13:31:30
 */

#ifndef _CODER_EZFFT_API_H
#define _CODER_EZFFT_API_H

/* Include Files */
#include "tmwtypes.h"
#include "mex.h"
#include "emlrt.h"
#include <stddef.h>
#include <stdlib.h>
#include "_coder_ezFFT_api.h"

/* Type Definitions */
#ifndef struct_emxArray_real_T
#define struct_emxArray_real_T

struct emxArray_real_T
{
  real_T *data;
  int32_T *size;
  int32_T allocatedSize;
  int32_T numDimensions;
  boolean_T canFreeData;
};

#endif                                 /*struct_emxArray_real_T*/

#ifndef typedef_emxArray_real_T
#define typedef_emxArray_real_T

typedef struct emxArray_real_T emxArray_real_T;

#endif                                 /*typedef_emxArray_real_T*/

/* Variable Declarations */
extern emlrtCTX emlrtRootTLSGlobal;
extern emlrtContext emlrtContextGlobal;

/* Function Declarations */
extern void ezFFT(emxArray_real_T *b_signal, real_T fs, emxArray_real_T
                  *frequencyAxis, emxArray_real_T *amplitudeAxis,
                  emxArray_real_T *phaseAxis, emxArray_real_T *powerSpectrumAxis);
extern void ezFFT_api(const mxArray * const prhs[2], int32_T nlhs, const mxArray
                      *plhs[4]);
extern void ezFFT_atexit(void);
extern void ezFFT_initialize(void);
extern void ezFFT_terminate(void);
extern void ezFFT_xil_terminate(void);

#endif

/*
 * File trailer for _coder_ezFFT_api.h
 *
 * [EOF]
 */
