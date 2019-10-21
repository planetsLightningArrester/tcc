%%
%Created by Francisco Gomes Soares Sanches Manso - UFMG 2019
%
%Description:
%   - Calculates the single sided FFT
%
%Input: 
%   - signal sampled
%   - sample frequency
%
%Output:
%   - FFT frequency axis [Hz]
%   - FFT amplitude axis
%   - FFT phase axis [Deg]
%   - FFT power spectrum axis
function [ frequencyAxis, amplitudeAxis , phaseAxis, powerSpectrumAxis] = ezFFT(signal, fs)
    %Single side frequency axis [Hz]
    L = length(signal);
    frequencyAxis = fs*(0:(L/2))/L;
    
    %Single side amplitude axis
    Y = fft(signal);
    P2 = abs(Y/L);
    amplitudeAxis = P2(1:L/2+1);
    amplitudeAxis(2:end-1) = 2*amplitudeAxis(2:end-1);
    
    %Single side power spectrum axis
    powerSpectrumAxis = P2(1:L/2+1);
    powerSpectrumAxis(2:end-1) = 2*powerSpectrumAxis(2:end-1);
    
    %Single side phase axis [deg]
    z = fftshift(Y);
    tol = 1e-6;
    z(abs(z) < tol) = 0;
    phaseAxis = angle(z);
    phaseAxis = phaseAxis(length(phaseAxis)/2 + 1: length(phaseAxis))*180/pi;
    
end

