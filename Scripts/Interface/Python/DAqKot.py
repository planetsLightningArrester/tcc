try:
    import os
    import sys
    import serial
    import time
    import datetime
    import threading
    import binascii
    from numpy import cos, sin, pi, absolute, arange
    from scipy.signal import kaiserord, lfilter, firwin, freqz
    from pylab import figure, clf, plot, xlabel, ylabel, xlim, ylim, title, grid, axes, show
except ImportError:
    os.popen("python -m pip install --user pyserial").read()
    os.popen("python -m pip install --user numpy scipy matplotlib ipython jupyter pandas sympy nose").read()

#----------------------------------------------------------------------------------------------------
#Processamento do sinal
#----------------------------------------------------------------------------------------------------
def signalProcessing(fileName):
    #------------------------------------------------
    # Get the signal.
    #------------------------------------------------

    print("Gerando os graficos")

    file = open(fileName, 'r')
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

    x = acc[3]

    sample_rate = 6500
    nsamples = len(acc[0])
    t = arange(nsamples) / sample_rate

    #------------------------------------------------
    # Create a FIR filter and apply it to x.
    #------------------------------------------------

    # The Nyquist rate of the signal.
    nyq_rate = sample_rate / 2.0

    # The desired width of the transition from pass to stop,
    # relative to the Nyquist rate.  We'll design the filter
    # with a 5 Hz transition width.
    width = 5.0/nyq_rate

    # The desired attenuation in the stop band, in dB.
    ripple_db = 60.0

    # Compute the order and Kaiser parameter for the FIR filter.
    N, beta = kaiserord(ripple_db, width)

    # The cutoff frequency of the filter.
    # cutoff_hz = 10.0
    cutoff_hz = 1000.0

    # Use firwin with a Kaiser window to create a lowpass FIR filter.
    taps = firwin(N, cutoff_hz/nyq_rate, window=('kaiser', beta))

    # Use lfilter to filter x with the FIR filter.
    filtered_x = lfilter(taps, 1.0, x)

    #------------------------------------------------
    # Plot the FIR filter coefficients.
    #------------------------------------------------

    figure(1)
    plot(taps, 'bo-', linewidth=2)
    title('Filter Coefficients (%d taps)' % N)
    grid(True)

    #------------------------------------------------
    # Plot the magnitude response of the filter.
    #------------------------------------------------

    figure(2)
    clf()
    w, h = freqz(taps, worN=8000)
    plot((w/pi)*nyq_rate, absolute(h), linewidth=2)
    xlabel('Frequency (Hz)')
    ylabel('Gain')
    title('Frequency Response')
    ylim(-0.05, 1.05)
    xlim(0, 2000)
    grid(True)

    # Upper inset plot.
    ax1 = axes([0.42, 0.6, .45, .25])
    plot((w/pi)*nyq_rate, absolute(h), linewidth=2)
    xlim(0,8.0)
    ylim(0.9985, 1.001)
    grid(True)

    # Lower inset plot
    ax2 = axes([0.42, 0.25, .45, .25])
    plot((w/pi)*nyq_rate, absolute(h), linewidth=2)
    xlim(12.0, 20.0)
    ylim(0.0, 0.0025)
    grid(True)

    #------------------------------------------------
    # Plot the original and filtered signals.
    #------------------------------------------------

    # The phase delay of the filtered signal.
    delay = 0.5 * (N-1) / sample_rate

    figure(3)
    # Plot the original signal.
    plot(t, x)
    # Plot the filtered signal, shifted to compensate for the phase delay.
    plot(t-delay, filtered_x, 'r-')
    # Plot just the "good" part of the filtered signal.  The first N-1
    # samples are "corrupted" by the initial conditions.
    plot(t[N-1:]-delay, filtered_x[N-1:], 'g', linewidth=4)

    xlabel('t')
    grid(True)

    show()

#----------------------------------------------------------------------------------------------------
#Processamento do arquivo
#----------------------------------------------------------------------------------------------------
def fileProcessing(file, dataPath):
    path = os.getcwd()

    #Se quiser que junte arquivos de 10 min
    cadaArquivoDeSaidaContemQuantosArquivosDeEntrada = 1
    outputPath = os.getcwd() + "\\output\\"
    if(not os.path.exists(os.path.dirname(outputPath))):
        os.makedirs(os.path.dirname(outputPath))

    _fileOutput = False
    filesCounter = 0
    runnedOnce = False
    acc = [[],[],[],[]]
    accData = ''

    bits2g = [0,0,0,0]
    offset = [0,0,0,0]

    timer = time.time()
    
    data = []
    prevPackageIndex = 0
    packageIndex = 0
    nPackagesLost = 0
    totalNumberOfPackagesLost = 0

    _file = open(dataPath + file, 'rb')
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

    bits2g[0] = float(boardInfo[0])*10     #100mg/V = 10V/g
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
        accData += str(acc[0][i]) + "\t" + str(acc[1][i]) + "\t" + str(acc[2][i]) + "\t" + str(acc[3][i]) + "\n" 
        
    if(not _fileOutput):
        _fileOutput = open(outputPath + file, "w")

    _fileOutput.write(accData)

    print("Tempo para processar: " + str(round((time.time() - timer), 2)) + "s")
    print("Foram perdidos " + str(round(totalNumberOfPackagesLost, 0)) + " pacotes de " + str(round((len(data)/32), 1)) + " (" + str(round(totalNumberOfPackagesLost*100/(len(data)/32), 3)) + "%)")

    _fileOutput = outputPath + file

    return _fileOutput

#----------------------------------------------------------------------------------------------------
#Interrupcao de criacao do arquivo
#----------------------------------------------------------------------------------------------------
def timerInterruption():
    global timerInterruptionController
    global timerInterruptionFlag

    timerInterruptionFlag = True

    #Reinicia o timer
    try:
        timerInterruptionController = threading.Timer(fileTimePartition, timerInterruption)
        timerInterruptionController.start()
    except KeyboardInterrupt:
        timerInterruptionController.cancel()
        sys.exit()

#----------------------------------------------------------------------------------------------------
#Main
#----------------------------------------------------------------------------------------------------
if __name__ == '__main__':

    if(len(sys.argv) > 1):
        comPort = sys.argv[1]
    else:
        comPort = raw_input("Entre com a porta serial do DAq: ")

    try:
        master = serial.Serial(comPort, baudrate = 15000000, timeout=3.0)
    except:
        print("Erro ao estabelecer conexao com a porta serial")

    master.set_buffer_size(rx_size = 12800, tx_size = 12800)

    data = ''
    counter = 0

    fileTimePartition =  1*60 # em segundos
    timerInterruptionFlag = False
    timerInterruptionController = False

    pathToSave = os.getcwd() + "\\data\\"

    if(not os.path.exists(os.path.dirname(pathToSave))):
        os.makedirs(os.path.dirname(pathToSave))

    date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
    date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
    date = str(date)
    date = date.replace('-','').replace(' ', '_').replace(':', '_')

    fileName = str(date) + ".txt"

    file = open(pathToSave + fileName, "w+b")

    try:

        #Obtem os valores de calibracao dos canais
        print("Obtendo valores de calibracao da placa.")
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
        print("Gravando...")

        #timerInterruptionController = timerInterruption()
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

            elif(timerInterruptionFlag):
                #Zera a flag interrupcao
                timerInterruptionFlag = False

                file.close()

                if(not os.path.exists(os.path.dirname(pathToSave))):
                    os.makedirs(os.path.dirname(pathToSave))

                date = list(str(datetime.datetime.now()).replace('-','').replace(' ', '_').replace(':', '_'))
                date = datetime.datetime(int(date[0] + date[1] + date[2] + date[3]),int(date[4] + date[5]),int(date[6] + date[7]),int(date[9] + date[10]),int(date[12] + date[13]),int(date[15] + date[16]))
                date = str(date)
                date = date.replace('-','').replace(' ', '_').replace(':', '_')

                fileName = str(date) + ".txt"

                file = open(pathToSave + fileName, "w+b")

                print("Criado arquivo: " + date + ".txt")
                
    except KeyboardInterrupt:
        if(file):
            file.close()
        master.write("stop")
        master.close()
        if(timerInterruptionController):
            timerInterruptionController.cancel()

        try:
            fileName = fileProcessing(fileName, pathToSave)
            try:
                signalProcessing(fileName)
            except KeyboardInterrupt:
                sys.exit()
        except KeyboardInterrupt:
            signalProcessing(pathToSave + "Output\\" + fileName)
        
        sys.exit()
