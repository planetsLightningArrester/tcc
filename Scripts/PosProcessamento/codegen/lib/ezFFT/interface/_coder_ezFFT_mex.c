/*
 * File: _coder_ezFFT_mex.c
 *
 * MATLAB Coder version            : 4.0
 * C/C++ source code generated on  : 20-Oct-2019 13:31:30
 */

/* Include Files */
#include "_coder_ezFFT_api.h"
#include "_coder_ezFFT_mex.h"

/* Function Declarations */
static void ezFFT_mexFunction(int32_T nlhs, mxArray *plhs[4], int32_T nrhs,
  const mxArray *prhs[2]);

/* Function Definitions */

/*
 * Arguments    : int32_T nlhs
 *                mxArray *plhs[4]
 *                int32_T nrhs
 *                const mxArray *prhs[2]
 * Return Type  : void
 */
static void ezFFT_mexFunction(int32_T nlhs, mxArray *plhs[4], int32_T nrhs,
  const mxArray *prhs[2])
{
  const mxArray *outputs[4];
  int32_T b_nlhs;
  emlrtStack st = { NULL,              /* site */
    NULL,                              /* tls */
    NULL                               /* prev */
  };

  st.tls = emlrtRootTLSGlobal;

  /* Check for proper number of arguments. */
  if (nrhs != 2) {
    emlrtErrMsgIdAndTxt(&st, "EMLRT:runTime:WrongNumberOfInputs", 5, 12, 2, 4, 5,
                        "ezFFT");
  }

  if (nlhs > 4) {
    emlrtErrMsgIdAndTxt(&st, "EMLRT:runTime:TooManyOutputArguments", 3, 4, 5,
                        "ezFFT");
  }

  /* Call the function. */
  ezFFT_api(prhs, nlhs, outputs);

  /* Copy over outputs to the caller. */
  if (nlhs < 1) {
    b_nlhs = 1;
  } else {
    b_nlhs = nlhs;
  }

  emlrtReturnArrays(b_nlhs, plhs, outputs);

  /* Module termination. */
  ezFFT_terminate();
}

/*
 * Arguments    : int32_T nlhs
 *                mxArray * const plhs[]
 *                int32_T nrhs
 *                const mxArray * const prhs[]
 * Return Type  : void
 */
void mexFunction(int32_T nlhs, mxArray *plhs[], int32_T nrhs, const mxArray
                 *prhs[])
{
  mexAtExit(ezFFT_atexit);

  /* Initialize the memory manager. */
  /* Module initialization. */
  ezFFT_initialize();

  /* Dispatch the entry-point. */
  ezFFT_mexFunction(nlhs, plhs, nrhs, prhs);
}

/*
 * Arguments    : void
 * Return Type  : emlrtCTX
 */
emlrtCTX mexFunctionCreateRootTLS(void)
{
  emlrtCreateRootTLS(&emlrtRootTLSGlobal, &emlrtContextGlobal, NULL, 1);
  return emlrtRootTLSGlobal;
}

/*
 * File trailer for _coder_ezFFT_mex.c
 *
 * [EOF]
 */
