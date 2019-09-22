import serial
import time

master = serial.Serial("COM6", baudrate = 15000000, timeout=3.0)
timer = time.time()
counter = 0

try:
    while True:
        if master.in_waiting:
            #print(int(master.read(master.in_waiting))/(time.time() - timer))
            master.read(master.in_waiting)
            counter = counter + 1
        if ((time.time() - timer) > 1):
            print(counter)
            counter = 0
            timer = time.time()
except KeyboardInterrupt:
    master.close()