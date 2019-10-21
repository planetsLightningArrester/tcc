/*
 * File: ezFFT.c
 *
 * MATLAB Coder version            : 4.0
 * C/C++ source code generated on  : 20-Oct-2019 13:31:30
 */

/* Include Files */
#include <math.h>
#include "rt_defines.h"
#include "rt_nonfinite.h"
#include "ezFFT.h"
#include "ezFFT_emxutil.h"
#include "abs.h"
#include "fft1.h"

/* Function Declarations */
static double rt_atan2d_snf(double u0, double u1);

/* Function Definitions */

/*
 * Arguments    : double u0
 *                double u1
 * Return Type  : double
 */
static double rt_atan2d_snf(double u0, double u1)
{
  double y;
  int b_u0;
  int b_u1;
  if (rtIsNaN(u0) || rtIsNaN(u1)) {
    y = rtNaN;
  } else if (rtIsInf(u0) && rtIsInf(u1)) {
    if (u0 > 0.0) {
      b_u0 = 1;
    } else {
      b_u0 = -1;
    }

    if (u1 > 0.0) {
      b_u1 = 1;
    } else {
      b_u1 = -1;
    }

    y = atan2(b_u0, b_u1);
  } else if (u1 == 0.0) {
    if (u0 > 0.0) {
      y = RT_PI / 2.0;
    } else if (u0 < 0.0) {
      y = -(RT_PI / 2.0);
    } else {
      y = 0.0;
    }
  } else {
    y = atan2(u0, u1);
  }

  return y;
}

/*
 * Single side frequency axis [Hz]
 * Arguments    : const emxArray_real_T *b_signal
 *                double fs
 *                emxArray_real_T *frequencyAxis
 *                emxArray_real_T *amplitudeAxis
 *                emxArray_real_T *phaseAxis
 *                emxArray_real_T *powerSpectrumAxis
 * Return Type  : void
 */
void ezFFT(const emxArray_real_T *b_signal, double fs, emxArray_real_T
           *frequencyAxis, emxArray_real_T *amplitudeAxis, emxArray_real_T
           *phaseAxis, emxArray_real_T *powerSpectrumAxis)
{
  double xtmp_re;
  int c_signal;
  int k;
  int npages;
  emxArray_creal_T *Y;
  emxArray_creal_T *r0;
  int d_signal[1];
  emxArray_real_T e_signal;
  emxArray_creal_T *b_Y;
  emxArray_real_T *P2;
  double xtmp_im;
  int vlend2;
  int a;
  emxArray_real_T *r1;
  emxArray_boolean_T *r2;
  int i2;
  int i;
  int i1;
  emxArray_int32_T *r3;
  int ib;

  /*  */
  /* Created by Francisco Gomes Soares Sanches Manso - UFMG 2019 */
  /*  */
  /* Description: */
  /*    - Calculates the single sided FFT */
  /*  */
  /* Input:  */
  /*    - signal sampled */
  /*    - sample frequency */
  /*  */
  /* Output: */
  /*    - FFT frequency axis [Hz] */
  /*    - FFT amplitude axis */
  /*    - FFT phase axis [Deg] */
  /*    - FFT power spectrum axis */
  xtmp_re = (double)b_signal->size[1] / 2.0;
  c_signal = b_signal->size[1];
  k = frequencyAxis->size[0] * frequencyAxis->size[1];
  frequencyAxis->size[0] = 1;
  frequencyAxis->size[1] = (int)floor(xtmp_re) + 1;
  emxEnsureCapacity_real_T(frequencyAxis, k);
  npages = (int)floor(xtmp_re);
  for (k = 0; k <= npages; k++) {
    frequencyAxis->data[frequencyAxis->size[0] * k] = fs * (double)k / (double)
      c_signal;
  }

  emxInit_creal_T(&Y, 2);
  emxInit_creal_T1(&r0, 1);

  /* Single side amplitude axis */
  d_signal[0] = b_signal->size[1];
  e_signal = *b_signal;
  e_signal.size = (int *)&d_signal;
  e_signal.numDimensions = 1;
  fft(&e_signal, b_signal->size[1], r0);
  k = Y->size[0] * Y->size[1];
  Y->size[0] = 1;
  Y->size[1] = b_signal->size[1];
  emxEnsureCapacity_creal_T(Y, k);
  npages = b_signal->size[1];
  for (k = 0; k < npages; k++) {
    Y->data[k] = r0->data[k];
  }

  emxFree_creal_T(&r0);
  emxInit_creal_T(&b_Y, 2);
  k = b_Y->size[0] * b_Y->size[1];
  b_Y->size[0] = 1;
  b_Y->size[1] = Y->size[1];
  emxEnsureCapacity_creal_T(b_Y, k);
  c_signal = b_signal->size[1];
  npages = Y->size[0] * Y->size[1];
  for (k = 0; k < npages; k++) {
    xtmp_re = Y->data[k].re;
    xtmp_im = Y->data[k].im;
    if (xtmp_im == 0.0) {
      b_Y->data[k].re = xtmp_re / (double)c_signal;
      b_Y->data[k].im = 0.0;
    } else if (xtmp_re == 0.0) {
      b_Y->data[k].re = 0.0;
      b_Y->data[k].im = xtmp_im / (double)c_signal;
    } else {
      b_Y->data[k].re = xtmp_re / (double)c_signal;
      b_Y->data[k].im = xtmp_im / (double)c_signal;
    }
  }

  emxInit_real_T(&P2, 2);
  b_abs(b_Y, P2);
  xtmp_re = (double)b_signal->size[1] / 2.0 + 1.0;
  npages = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  k = amplitudeAxis->size[0] * amplitudeAxis->size[1];
  amplitudeAxis->size[0] = 1;
  amplitudeAxis->size[1] = npages;
  emxEnsureCapacity_real_T(amplitudeAxis, k);
  emxFree_creal_T(&b_Y);
  for (k = 0; k < npages; k++) {
    amplitudeAxis->data[amplitudeAxis->size[0] * k] = P2->data[k];
  }

  k = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  if (2 > k - 1) {
    k = 0;
    vlend2 = 0;
  } else {
    k = 1;
    vlend2 = (int)xtmp_re - 1;
  }

  a = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  a = !(2 > a - 1);
  emxInit_real_T(&r1, 2);
  c_signal = r1->size[0] * r1->size[1];
  r1->size[0] = 1;
  r1->size[1] = vlend2 - k;
  emxEnsureCapacity_real_T(r1, c_signal);
  npages = vlend2 - k;
  for (vlend2 = 0; vlend2 < npages; vlend2++) {
    r1->data[r1->size[0] * vlend2] = 2.0 * amplitudeAxis->data[k + vlend2];
  }

  npages = r1->size[1];
  for (k = 0; k < npages; k++) {
    amplitudeAxis->data[a + k] = r1->data[r1->size[0] * k];
  }

  /* Single side power spectrum axis */
  xtmp_re = (double)b_signal->size[1] / 2.0 + 1.0;
  npages = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  k = powerSpectrumAxis->size[0] * powerSpectrumAxis->size[1];
  powerSpectrumAxis->size[0] = 1;
  powerSpectrumAxis->size[1] = npages;
  emxEnsureCapacity_real_T(powerSpectrumAxis, k);
  for (k = 0; k < npages; k++) {
    powerSpectrumAxis->data[powerSpectrumAxis->size[0] * k] = P2->data[k];
  }

  k = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  if (2 > k - 1) {
    k = 0;
    vlend2 = 0;
  } else {
    k = 1;
    vlend2 = (int)xtmp_re - 1;
  }

  a = (int)((double)b_signal->size[1] / 2.0 + 1.0);
  a = !(2 > a - 1);
  c_signal = r1->size[0] * r1->size[1];
  r1->size[0] = 1;
  r1->size[1] = vlend2 - k;
  emxEnsureCapacity_real_T(r1, c_signal);
  npages = vlend2 - k;
  for (vlend2 = 0; vlend2 < npages; vlend2++) {
    r1->data[r1->size[0] * vlend2] = 2.0 * powerSpectrumAxis->data[k + vlend2];
  }

  npages = r1->size[1];
  for (k = 0; k < npages; k++) {
    powerSpectrumAxis->data[a + k] = r1->data[r1->size[0] * k];
  }

  emxFree_real_T(&r1);

  /* Single side phase axis [deg] */
  for (c_signal = 0; c_signal < 2; c_signal++) {
    a = Y->size[c_signal];
    if (!(Y->size[c_signal] <= 1)) {
      vlend2 = Y->size[c_signal] / 2;
      npages = 1;
      k = c_signal + 2;
      while (k < 3) {
        npages *= Y->size[1];
        k = 3;
      }

      if (vlend2 << 1 == Y->size[c_signal]) {
        i2 = 0;
        for (i = 1; i <= npages; i++) {
          i1 = i2;
          i2 += a;
          ib = i1 + vlend2;
          for (k = 1; k <= vlend2; k++) {
            xtmp_re = Y->data[i1].re;
            xtmp_im = Y->data[i1].im;
            Y->data[i1] = Y->data[ib];
            Y->data[ib].re = xtmp_re;
            Y->data[ib].im = xtmp_im;
            i1++;
            ib++;
          }
        }
      } else {
        i2 = 0;
        for (i = 1; i <= npages; i++) {
          i1 = i2;
          i2 += a;
          ib = i1 + vlend2;
          xtmp_re = Y->data[ib].re;
          xtmp_im = Y->data[ib].im;
          for (k = 1; k <= vlend2; k++) {
            Y->data[ib] = Y->data[i1];
            Y->data[i1] = Y->data[ib + 1];
            i1++;
            ib++;
          }

          Y->data[ib].re = xtmp_re;
          Y->data[ib].im = xtmp_im;
        }
      }
    }
  }

  emxInit_boolean_T(&r2, 2);
  b_abs(Y, P2);
  k = r2->size[0] * r2->size[1];
  r2->size[0] = 1;
  r2->size[1] = P2->size[1];
  emxEnsureCapacity_boolean_T(r2, k);
  npages = P2->size[0] * P2->size[1];
  for (k = 0; k < npages; k++) {
    r2->data[k] = (P2->data[k] < 1.0E-6);
  }

  vlend2 = r2->size[1] - 1;
  c_signal = 0;
  for (i = 0; i <= vlend2; i++) {
    if (r2->data[i]) {
      c_signal++;
    }
  }

  emxInit_int32_T(&r3, 2);
  k = r3->size[0] * r3->size[1];
  r3->size[0] = 1;
  r3->size[1] = c_signal;
  emxEnsureCapacity_int32_T(r3, k);
  c_signal = 0;
  for (i = 0; i <= vlend2; i++) {
    if (r2->data[i]) {
      r3->data[c_signal] = i + 1;
      c_signal++;
    }
  }

  emxFree_boolean_T(&r2);
  npages = r3->size[0] * r3->size[1] - 1;
  for (k = 0; k <= npages; k++) {
    Y->data[r3->data[k] - 1].re = 0.0;
    Y->data[r3->data[k] - 1].im = 0.0;
  }

  emxFree_int32_T(&r3);
  k = phaseAxis->size[0] * phaseAxis->size[1];
  phaseAxis->size[0] = 1;
  phaseAxis->size[1] = Y->size[1];
  emxEnsureCapacity_real_T(phaseAxis, k);
  for (k = 0; k < Y->size[1]; k++) {
    phaseAxis->data[k] = rt_atan2d_snf(Y->data[k].im, Y->data[k].re);
  }

  emxFree_creal_T(&Y);
  xtmp_re = (double)phaseAxis->size[1] / 2.0;
  if (xtmp_re + 1.0 > phaseAxis->size[1]) {
    k = 0;
    vlend2 = 0;
  } else {
    k = (int)(xtmp_re + 1.0) - 1;
    vlend2 = phaseAxis->size[1];
  }

  a = P2->size[0] * P2->size[1];
  P2->size[0] = 1;
  P2->size[1] = vlend2 - k;
  emxEnsureCapacity_real_T(P2, a);
  npages = vlend2 - k;
  for (vlend2 = 0; vlend2 < npages; vlend2++) {
    P2->data[P2->size[0] * vlend2] = phaseAxis->data[k + vlend2] * 180.0 /
      3.1415926535897931;
  }

  k = phaseAxis->size[0] * phaseAxis->size[1];
  phaseAxis->size[0] = 1;
  phaseAxis->size[1] = P2->size[1];
  emxEnsureCapacity_real_T(phaseAxis, k);
  npages = P2->size[1];
  for (k = 0; k < npages; k++) {
    phaseAxis->data[phaseAxis->size[0] * k] = P2->data[P2->size[0] * k];
  }

  emxFree_real_T(&P2);
}

/*
 * File trailer for ezFFT.c
 *
 * [EOF]
 */
