clc
clear

%%Projeto do FAA da placa de aquisicao de acelerometros
Vin_max = 19;
Vin_av = 14;
Vin_excursaoTotal = 10;

G = 15/90;

Vo_av = Vin_av*G;
Vo_max = (Vin_av + Vin_excursaoTotal/2)*G;
Vo_min = (Vin_av - Vin_excursaoTotal/2)*G;

Vo_1mg = (Vo_max - Vo_av)/50000;
Vo_50mg = Vo_1mg*50;

%Após o divisor de tensão, 1 mg representa 16,67uV
%Entao, 50 mg representam 833,3uV
%A resolução do conversor ADC é de 805,66uV

Fs = 3000;            % Sampling frequency                    
T = 1/Fs;             % Sampling period       
L = 1500;             % Length of signal
t = (0:L-1)*T;        % Time vector
S = 0.7*sin(2*pi*50*t) + sin(2*pi*120*t);

subplot(3,1,1);
plot(t, S);
title('Sinal original')
xlabel('t (s)');
ylabel('S(t)');
axis([0 .1 -2 2]);

Fs = 1500;            % Sampling frequency                    
T = 1/Fs;             % Sampling period       
L = 1500;             % Length of signal
t = (0:L-1)*T;        % Time vector
S = 0.7*sin(2*pi*50*t) + sin(2*pi*120*t);

subplot(3,1,2);
plot(t, S);
title('Sinal aquisitado')
xlabel('t (s)');
ylabel('S(t)');
axis([0 .1 -2 2]);

[ frequencyAxis, powerAxis ] = quickFFT(S, Fs);

subplot(3,1,3);
plot(frequencyAxis, powerAxis)
title('FFT do sinal aquisitado')
xlabel('f (Hz)');
ylabel('|S(f)|');

j = 1;
s = [0 0];
f = s;

for i = 1:length(powerAxis)
    if(powerAxis(i) > 0.1)
      s(j) = powerAxis(i);
      f(j) = frequencyAxis(i);
      j = j + 1;
    end
end

S = 0;

for i = 1:length(s)
    S = S + s(i)*sin(2*pi*f(i)*t);
end

% subplot(3,1,1);
% plot(t, S);
% title('Sinal Aquisitado')
% xlabel('t (s)');
% ylabel('S(t)');
% axis([0 .1 -2 2]);