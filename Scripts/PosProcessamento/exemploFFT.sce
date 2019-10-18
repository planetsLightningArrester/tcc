

sample_rate=1000;
t = 0:1/sample_rate:0.6;
N=size(t,'*'); //number of samples
f1 = 50;
f2 = 20;
s=2*sin(2*%pi*f1*t)+sin(2*%pi*f2*t+%pi/4);

//If data lost
//s(110) = s(111);

y=fft(s);

//s is real so the fft response is conjugate symmetric and we retain only the first N/2 points
f=sample_rate*(0:(N/2))/N; //associated frequency vector
n=size(f,'*')
figure(0)
plot(f,abs(y(1:n))/(length(f)))
