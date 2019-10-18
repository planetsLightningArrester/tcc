import os
import sys
import time

fileName = "20191017_22_45_51.txt"

folderPath = "C:\\codeCave\\03-TCC\\Scripts\\Data\\Output\\"

file = open(folderPath + fileName, 'r')
data = file.read()

data = ('\t'.join(data.split("\n"))).split("\t")
acc = [[],[],[],[]]

for i in range(0, len(data) - 1, 4):
    acc[0].append(data[i])
    acc[1].append(data[i + 1])
    acc[2].append(data[i + 2])
    acc[3].append(data[i + 3])

acc[0] = [float(i) for i in acc[0]]
acc[1] = [float(i) for i in acc[1]]
acc[2] = [float(i) for i in acc[2]]
acc[3] = [float(i) for i in acc[3]]
