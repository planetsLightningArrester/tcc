import sys
import os
import binascii
import time

path = os.getcwd()

#Se quiser que junte arquivos de 10 min
cadaArquivoDeSaidaContemQuantosArquivosDeEntrada = 1
outputPath = os.getcwd() + "\\Output\\"
if(not os.path.exists(os.path.dirname(outputPath))):
    os.makedirs(os.path.dirname(outputPath))

_fileOutput = False
filesCounter = 0
runnedOnce = False
acc = [[],[],[],[]]
accData = ''

bits2g = [0,0,0,0]
offset = [0,0,0,0]

overwriteFiles = False

if(len(sys.argv) > 1):
    if("--overwrite" in sys.argv):
        overwriteFiles = True
        print("Arquivos ja existentes serao sobrescritos")
    
# r=root, d=directories, f = files
for r,d,f in os.walk(path):
    if not runnedOnce:
        runnedOnce = True
        for file in f:
            if '.txt' in file:
                if(os.path.exists(outputPath + file) and (not overwriteFiles)):
                    print("O arquivo " + file + " ja foi processado. Para processar arquivos ja existentes use o argumento --overwrite")
                else:
                    timer = time.time()
                    
                    data = []
                    prevPackageIndex = 0
                    packageIndex = 0
                    nPackagesLost = 0
                    totalNumberOfPackagesLost = 0

                    _file = open(file, 'rb')
                    data = _file.read()
                    _file.close()

                    if(filesCounter == cadaArquivoDeSaidaContemQuantosArquivosDeEntrada):
                        _fileOutput.close()
                        _fileOutput = False
                        filesCounter = 0
                        accData = ''
                        acc = [[],[],[],[]]

                    filesCounter = filesCounter + 1
                    print("Processando arquivo: " + file)
                    
                    boardInfo = data.split(",", 8)

                    bits2g[0] = float(boardInfo[0])*10     #100mg/V
                    bits2g[1] = float(boardInfo[1])*10
                    bits2g[2] = float(boardInfo[2])*10
                    bits2g[3] = float(boardInfo[3])*10

                    offset[0] = float(boardInfo[4])
                    offset[1] = float(boardInfo[5])
                    offset[2] = float(boardInfo[6])
                    offset[3] = float(boardInfo[7])

                    data = boardInfo[8]

                    for i in range(0, len(data), 32):
                        if(i != 0):
                            
                            packageIndex = ord(data[i + 31]) & 0xFF

                            if((prevPackageIndex == (packageIndex - 1)) | (packageIndex == 0)):
                                pass
                            else:
                                nPackagesLost = abs(packageIndex - prevPackageIndex)
                                totalNumberOfPackagesLost += nPackagesLost

                            prevPackageIndex = packageIndex
                        else:
                            prevPackageIndex = ((ord(data[31]) & 0xFF) << 4)

                        for j in range(nPackagesLost + 1):
                            acc[0].append((ord(data[1 + i]) & 0xFF) + ((ord(data[2 + i]) & 0x0F)<<8))
                            acc[1].append(((ord(data[2 + i]) & 0xF0)>>4) + ((ord(data[3 + i]) & 0xFF)<<4))
                            acc[2].append((ord(data[4 + i]) & 0xFF) + ((ord(data[5 + i]) & 0x0F)<<8))
                            acc[3].append(((ord(data[5 + i]) & 0xF0)>>4) + ((ord(data[6 + i]) & 0xFF)<<4))

                            acc[0].append((ord(data[7 + i]) & 0xFF) + ((ord(data[8 + i]) & 0x0F)<<8))
                            acc[1].append(((ord(data[8 + i]) & 0xF0)>>4) + ((ord(data[9 + i]) & 0xFF)<<4))
                            acc[2].append((ord(data[10 + i]) & 0xFF) + ((ord(data[11 + i]) & 0x0F)<<8))
                            acc[3].append(((ord(data[11 + i]) & 0xF0)>>4) + ((ord(data[12 + i]) & 0xFF)<<4))

                            acc[0].append((ord(data[13 + i]) & 0xFF) + ((ord(data[14 + i]) & 0x0F)<<8))
                            acc[1].append(((ord(data[14 + i]) & 0xF0)>>4) + ((ord(data[15 + i]) & 0xFF)<<4))
                            acc[2].append((ord(data[16 + i]) & 0xFF) + ((ord(data[17 + i]) & 0x0F)<<8))
                            acc[3].append(((ord(data[17 + i]) & 0xF0)>>4) + ((ord(data[18 + i]) & 0xFF)<<4))

                            acc[0].append((ord(data[19 + i]) & 0xFF) + ((ord(data[20 + i]) & 0x0F)<<8))
                            acc[1].append(((ord(data[20 + i]) & 0xF0)>>4) + ((ord(data[21 + i]) & 0xFF)<<4))
                            acc[2].append((ord(data[22 + i]) & 0xFF) + ((ord(data[23 + i]) & 0x0F)<<8))
                            acc[3].append(((ord(data[23 + i]) & 0xF0)>>4) + ((ord(data[24 + i]) & 0xFF)<<4))

                            acc[0].append((ord(data[25 + i]) & 0xFF) + ((ord(data[26 + i]) & 0x0F)<<8))
                            acc[1].append(((ord(data[26 + i]) & 0xF0)>>4) + ((ord(data[27 + i]) & 0xFF)<<4))
                            acc[2].append((ord(data[28 + i]) & 0xFF) + ((ord(data[29 + i]) & 0x0F)<<8))
                            acc[3].append(((ord(data[29 + i]) & 0xF0)>>4) + ((ord(data[30 + i]) & 0xFF)<<4))

                        nPackagesLost = 0

                    #Convert to g
                    for i in range(len(acc[0])):
                        acc[0][i] = (acc[0][i] - offset[0])*bits2g[0]
                        acc[1][i] = (acc[1][i] - offset[1])*bits2g[1]
                        acc[2][i] = (acc[2][i] - offset[2])*bits2g[2]
                        acc[3][i] = (acc[3][i] - offset[3])*bits2g[3]
                        accData += str(acc[0][i]) + "," + str(acc[1][i]) + "," + str(acc[2][i]) + "," + str(acc[3][i]) + "\n" 
                        
                    if(not _fileOutput):
                        _fileOutput = open(outputPath + file, "w")

                    _fileOutput.write(accData)

                    print("Tempo para processar: " + str(round((time.time() - timer), 2)) + "s")
                    print("Foram perdidos " + str(round(totalNumberOfPackagesLost, 0)) + " pacotes de " + str(round((len(data)/32), 1)) + " (" + str(round(totalNumberOfPackagesLost*100/(len(data)/32), 3)) + "%)")

                    #print(accData)


#data = (open(path + "\\230919_14_05_54.00.txt", 'rb')).read()



