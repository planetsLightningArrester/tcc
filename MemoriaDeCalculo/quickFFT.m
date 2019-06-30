function [ frequencyAxis, powerAxis ] = quickFFT(signal, fs)
    L = length(signal);
    frequencyAxis = fs*(0:(L/2))/L;
    Y = fft(signal);
    P2 = abs(Y/L);
    powerAxis = P2(1:L/2+1);
    powerAxis(2:end-1) = 2*powerAxis(2:end-1);
end

