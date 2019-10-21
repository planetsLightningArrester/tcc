dado = csvread('C:\\codeCave\\03-TCC\\Scripts\\PosProcessamento\\20191018_13_43_13.txt',0,0);

%%
%Filtro media móvel - correntes
windowSize = 50; 
b = (1/windowSize)*ones(1,windowSize);
a = 1;

%%
fs = 6500;
dado = dado(:,4);

dado = bandpass(dado,[40 50],fs);

plot(dado)