import serial
import time

master = serial.Serial("COM6", baudrate = 15000000, timeout=3.0)
slave = serial.Serial("COM1", baudrate = 2000000, timeout=3.0)
timer = time.time()
counter = 0

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

acc = [0 for i in range(4)]
accIndex = 0
try:
    j = 0
    master.write("start")
    while True:
        if master.in_waiting > 30:
            data = bytearray(master.read(31))
            for i in range(4):
                accIndex = 0
                acc[accIndex] = (data[1 + i*6] & 0xFF) + ((data[2 + i*6] & 0x0F)<<8)
                accIndex = accIndex + 1
                acc[accIndex] = ((data[2 + i*6] & 0xF0)>>4) + ((data[3 + i*6] & 0xFF)<<4)
                accIndex = accIndex + 1

                acc[accIndex] = (data[4 + i*6] & 0xFF) + ((data[5 + i*6] & 0x0F)<<8)
                accIndex = accIndex + 1
                acc[accIndex] = ((data[5 + i*6] & 0xF0)>>4) + ((data[6 + i*6] & 0xFF)<<4)
                # slave.write(str(acc[0]) + '\t' + str(acc[1]) + '\t' + str(acc[2]) + '\t' + str(acc[3]) + '\n')
                print(acc)
                print("********************")
except KeyboardInterrupt:
    master.write("stop")
    master.close()
    slave.close()