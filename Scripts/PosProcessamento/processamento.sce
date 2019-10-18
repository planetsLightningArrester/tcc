sample_rate = 6500;

fileName = "C:\\codeCave\\03-TCC\\Scripts\\Interface\\Python\\output\\20191018_00_35_55.txt"
signal = csvRead(fileName, '\t', '.', 'double');
FIR_coefficients = ffilt("bp", 20, 3, 1000);
filteredSignal = convol(FIR_coefficients, signal(:,4));

//t = 0:(1/sample_rate):((length(signal(:,4))-1)/sample_rate);
//figure(0)
//plot(t, signal(:,4));


t = 0:(1/sample_rate):((length(filteredSignal)-1)/sample_rate);
figure(10)
plot(t, filteredSignal);


//fftSig = filteredSignal(40*sample_rate:42*sample_rate);
//N=length(fftSig)-1; //number of samples

fftSig = signal(40*sample_rate:42*sample_rate, 4);
N=length(fftSig)-1; //number of samples

y=fft(fftSig);

//s is real so the fft response is conjugate symmetric and we retain only the first N/2 points
f=sample_rate*(0:(N/2))/N; //associated frequency vector
n=size(f,'*')
//figure(2)
//plot(f,abs(y(1:n))/(length(f)))

figure(3)
analyze(fftSig, 2, 100, sample_rate, N)
