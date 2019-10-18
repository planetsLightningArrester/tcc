dado = csvread('C:\\codeCave\\03-TCC\\Scripts\\Data\\Output\\20191018_00_35_55.txt',0,0);

%%
%Filtro media móvel - correntes
windowSize = 50; 
b = (1/windowSize)*ones(1,windowSize);
a = 1;

%%
dado = dado(:,4);

dado = filter(b,a,dado);

plot(dado)