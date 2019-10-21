
fs = 100;
t = 0:1/fs:1-1/fs;

a1 = 1;
a2 = 1;
phi1 = -pi/4;
phi2 = pi;
f1 = 20;
f2 = 40;

x = a1*cos(2*pi*f1*t + phi1) + a2*cos(2*pi*f2*t + phi2);

y = fft(x);
z = fftshift(y);

ly = length(y);
f = (-ly/2:ly/2-1)/ly*fs;

figure(1)
subplot(2,1,1);
yAbs = abs(z)/(ly/2);
yAbs = yAbs(length(yAbs)/2 + 1:length(yAbs));
f = f(length(f)/2 + 1: length(f));
stem(f,yAbs)
xlabel 'Frequency (Hz)'
ylabel '|y|'
grid

subplot(2,1,2);
tol = 1e-6;
z(abs(z) < tol) = 0;

theta = angle(z);

theta = theta(length(theta)/2 + 1: length(theta))*180/pi;
stem(f,theta)
xlabel 'Frequency (Hz)'
ylabel 'Phase (Degrees)'
grid