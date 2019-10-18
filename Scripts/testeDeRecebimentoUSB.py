import serial
import time
import os
import datetime
import threading
import sys

master = serial.Serial("COM7", baudrate = 15000000, timeout=3.0)
# slave = serial.Serial("COM1", baudrate = 2000000, timeout=3.0)
timer = time.time()
counter = 0

master.set_buffer_size(rx_size = 12800, tx_size = 12800)

# try:
#     master.write("start")
#     while True:
#         if master.in_waiting:
#             timer = time.time() - timer
#             master.read(master.in_waiting)
#             print(timer)
#             timer = time.time()
# except KeyboardInterrupt:
#     master.write("stop")
#     master.close()
#     slave.close()

# try:
#     master.write("start")
#     while True:
#         if master.in_waiting:
#             #print(int(master.read(master.in_waiting))/(time.time() - timer))
#             master.read(master.in_waiting)
#             counter = counter + 1
#         if ((time.time() - timer) > 1):
#             print(counter)
#             counter = 0
#             timer = time.time()
# except KeyboardInterrupt:
#     master.write("stop")
#     master.close()
#     slave.close()

# try:
#     master.write("start")
#     while True:
#         if master.in_waiting:
#             master.read(master.in_waiting)
#             counter = counter + 1
#         if (counter > 1340):
#             time.time() - timer
#             print(time.time() - timer)
#             counter = 0
#             timer = time.time()
# except KeyboardInterrupt:
#     master.write("stop")
#     master.close()
#     slave.close()

#----------------------------------------------------------------------------------------------------
#Interrupcao de criacao do arquivo
#----------------------------------------------------------------------------------------------------
def _10minInterrupt():
    global _10minTimer
    global _10minFlag

    _10minFlag = True

    #Reinicia o timer
    try:
        _10minTimer = threading.Timer(fileTimePartition, _10minInterrupt)
        _10minTimer.start()
    except KeyboardInterrupt:
        _10minTimer.cancel()
        sys.exit()

#----------------------------------------------------------------------------------------------------
#Main
#----------------------------------------------------------------------------------------------------

acc = [[0 for i in range(4)] for j in range(1000)]
accIndex = 0
counter = 0
counterError = 0
counterErrorIndex = 0

data = ''

packageCounter = 0
previousPackageCounter = -1

pathToSave = os.getcwd() + "\\Data\\"
fileTimePartition =  1*60 # em segundos
_10minFlag = False
_10minTimer = False

if(not os.path.exists(os.path.dirname(pathToSave))):
    os.makedirs(os.path.dirname(pathToSave))

date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
date = str(date)
date = date.replace('-','').replace(' ', '_').replace(':', '_')

file = open(pathToSave + str(date) + ".txt", "w+b")

try:

    #Obtem os valores de calibracao dos canais
    print("Obtendo valores de calibracao da placa...")
    master.write("getCalibration:3")
    
    tic = time.time()
    while ((not master.in_waiting) and ((time.time() - tic) < 3500)):
        time.sleep(0.1)
    
    if master.in_waiting:
        bits2volts = []
        bits2volts_str = master.read(master.in_waiting)
        bits2volts = bits2volts_str.split(",")
        bits2volts = [float(i) for i in bits2volts]
    else:
        print("[ERRO]: Erro ao obter a calibracao da placa")
        raise KeyboardInterrupt()

    #Obtem os valores de offset
    master.write("getOffset:3")
    
    tic = time.time()
    while ((not master.in_waiting) and ((time.time() - tic) < 3500)):
        time.sleep(0.1)
    
    if master.in_waiting:
        offset = []
        offset_str = master.read(master.in_waiting)
        offset = offset_str.split(",")
        offset = [float(i) for i in offset]
    else:
        print("[ERRO]: Erro ao obter offsets")
        raise KeyboardInterrupt()

    data += ",".join([str(i) for i in bits2volts])
    data += ','
    data += ",".join([str(i) for i in offset])
    data += ','

    file.write(data)

    data = []

    #Rotina de coleta de dados
    print("Iniciando gravacao")

    #_10minTimer = _10minInterrupt()
    master.write("start")
    tic = time.time()
    while True:
        if master.in_waiting >= 32:

            if(counter != 0):
                data += bytearray(master.read(32))
            else:
                data = bytearray(master.read(32))            
            counter += 1

            if(counter > 300):

                file.write(data)
                counter = 0

        elif(_10minFlag):
            #Zera a flag de 10 min
            _10minFlag = False

            file.close()

            if(not os.path.exists(os.path.dirname(pathToSave))):
                os.makedirs(os.path.dirname(pathToSave))

            date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
            date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
            date = str(date)
            date = date.replace('-','').replace(' ', '_').replace(':', '_')

            file = open(pathToSave + str(date) + ".txt", "w+b")

            print("Criado arquivo: " + date + ".txt")
            
except KeyboardInterrupt:
    if(file):
        file.close()
    master.write("stop")
    master.close()
    # slave.close()
    if(_10minTimer):
        _10minTimer.cancel()
    sys.exit()

# #----------------------------------------------------------------------------------------------------
# #Main
# #----------------------------------------------------------------------------------------------------

# acc = [[0 for i in range(4)] for j in range(1000)]
# accIndex = 0
# counter = 0
# counterError = 0
# counterErrorIndex = 0

# data = []

# packageCounter = 0
# previousPackageCounter = -1

# pathToSave = os.getcwd() + "\\Data\\"
# fileTimePartition =  1*60 # em segundos
# _10minFlag = False
# _10minTimer = False

# if(not os.path.exists(os.path.dirname(pathToSave))):
#     os.makedirs(os.path.dirname(pathToSave))

# date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
# date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
# date = str(date)
# date = date.replace('-','').replace(' ', '_').replace(':', '_')

# file = open(pathToSave + str(date) + ".txt", "w+b")

# try:

#     #Obtem os valores de calibracao dos canais
#     print("Obtendo valores de calibracao da placa...")
#     master.write("getCalibration:3")
    
#     tic = time.time()
#     while ((not master.in_waiting) and ((time.time() - tic) < 3500)):
#         time.sleep(0.1)
    
#     if master.in_waiting:
#         bits2volts = []
#         bits2volts_str = master.read(master.in_waiting)
#         bits2volts = bits2volts_str.split(",")
#         bits2volts = [float(i) for i in bits2volts]
#     else:
#         print("[ERRO]: Erro ao obter a calibracao da placa")
#         raise KeyboardInterrupt()

#     #Obtem os valores de offset
#     master.write("getOffset:3")
    
#     tic = time.time()
#     while ((not master.in_waiting) and ((time.time() - tic) < 3500)):
#         time.sleep(0.1)
    
#     if master.in_waiting:
#         offset = []
#         offset_str = master.read(master.in_waiting)
#         offset = offset_str.split(",")
#         offset = [float(i) for i in offset]
#     else:
#         print("[ERRO]: Erro ao obter offsets")
#         raise KeyboardInterrupt()

#     data += bits2volts_str
#     data += ','
#     data += offset_str

#     file.write(data)

#     data = ''

#     #Rotina de coleta de dados
#     print("Iniciando gravacao")

#     j = 0
#     _10minTimer = _10minInterrupt()
#     master.write("start")
#     tic = time.time()
#     while True:
#         if master.in_waiting >= 32:
#             if(counter != 0):
#                 data += bytearray(master.read(32))
#             else:
#                 data = bytearray(master.read(32))

#             # packageCounter = data[31 + counter*32]
            
#             counter += 1

#             # for i in range(4):
#             #     accIndex = 0
#             #     acc[accIndex].append((data[1 + i*6] & 0xFF) + ((data[2 + i*6] & 0x0F)<<8))
#             #     accIndex = accIndex + 1
#             #     acc[accIndex].append(((data[2 + i*6] & 0xF0)>>4) + ((data[3 + i*6] & 0xFF)<<4))
#             #     accIndex = accIndex + 1

#             #     acc[accIndex].append((data[4 + i*6] & 0xFF) + ((data[5 + i*6] & 0x0F)<<8))
#             #     accIndex = accIndex + 1
#             #     acc[accIndex].append(((data[5 + i*6] & 0xF0)>>4) + ((data[6 + i*6] & 0xFF)<<4))

#             # packageCounter = data[31]

#             # if((previousPackageCounter == (packageCounter - 1)) | (packageCounter == 0)):
#             #     pass
#             # else:
#             #     counterError +=1 
#             #     #console.log("Dado perdido: " + packageCounter.toString() + " " + previousPackageCounter.toString())
            
#             # previousPackageCounter = packageCounter
#             if(counter > 300):
#                 # slave.write(str(acc[0]) + '\n')
#                 # slave.write(str(acc[0]) + '\t' + str(acc[1]) + '\t' + str(acc[2]) + '\t' + str(acc[3]) + '\n')
#                 # print(acc)
#                 # print("********************")
#                 file.write(data)
#                 # print(counterError)
#                 # counterError = 0
#                 counter = 0
#         elif(_10minFlag):
#             #Zera a flag de 10 min
#             _10minFlag = False

#             file.close()

#             if(not os.path.exists(os.path.dirname(pathToSave))):
#                 os.makedirs(os.path.dirname(pathToSave))

#             date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
#             date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
#             date = str(date)
#             date = date.replace('-','').replace(' ', '_').replace(':', '_')

#             file = open(pathToSave + str(date) + ".txt", "w+b")

#             print("Criado arquivo: " + date + ".txt")
            
# except KeyboardInterrupt:
#     if(file):
#         file.close()
#     master.write("stop")
#     master.close()
#     # slave.close()
#     if(_10minTimer):
#         _10minTimer.cancel()
#     sys.exit()

