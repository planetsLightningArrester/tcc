/*Import external global variables*/
//SPI module
extern SPI_HandleTypeDef hspi2;
//USB data
extern unsigned int indexUSB;
extern char bufUSB[100];

#define DIGITAL 0
#define ANALOG 1

uint8_t flushCounter = 0;
bool mode = DIGITAL;

void digitalMasterRoutine(uint8_t channel){
    char RF24buf[100];      //Buffer to receive data from nRF24
	uint8_t pipeData[100];  //Buffer with data received + pipe
	int _pipe, i;      //Var to store the data's last pipe
	char aux[100];
	unsigned int indexAux;
	bool activePipes[6] = {true, false, false, false, false, false};

    HAL_Delay(500);         //Wait for nRF24 initialization
    RF24init(&hspi2, 29, 25, channel);  //Initialize nRF24

    /*Loop*/
    while(1){
        if(RF24available()){                    //If there's any available nRF24 data
            _pipe = RF24available() - 1;         //Get the pipe's data
            RF24read(RF24buf);                  //Get the data
            
            //Merge data and pipe in the same buffer
            //sprintf(pipeData, "pipe%u:\r\n", _pipe);
            sprintf(pipeData, "pipe%u:", _pipe); //Insert pipe

            if(mode == DIGITAL){
                pipeData[6] = RF24buf[0];           //Acx
                pipeData[7] = RF24buf[1];           //^
                pipeData[8] = RF24buf[2];           //Acy
                pipeData[9] = RF24buf[3];           //^
                pipeData[10] = RF24buf[4];          //Acz
                pipeData[11] = RF24buf[5];          //^
                pipeData[12] = RF24buf[6];          //Battery level
                pipeData[13] = RF24buf[7];          //Milliseconds
                pipeData[14] = RF24buf[8];          //^
                pipeData[15] = RF24buf[9];          //^
                pipeData[16] = RF24buf[10];         //^
                CDC_Transmit_FS(pipeData, 17);      //Transmit data through USB
            }
            else {
                pipeData[6] = RF24buf[0];           //Ch0
                pipeData[7] = RF24buf[1];           //^
                pipeData[8] = RF24buf[2];           //Ch1
                pipeData[9] = RF24buf[3];           //^
                pipeData[10] = RF24buf[4];          //Ch2
                pipeData[11] = RF24buf[5];          //^
                pipeData[12] = RF24buf[6];          //Ch3
                pipeData[13] = RF24buf[7];          //^
                pipeData[14] = RF24buf[8];          //SampleCounter
                pipeData[15] = RF24buf[9];          //^
                pipeData[16] = RF24buf[10];         //^
                pipeData[17] = RF24buf[11];         //^
                CDC_Transmit_FS(pipeData, 18);      //Transmit data through USB
            }
        }

	    if(indexUSB){                           //If there's available USB data
	    	if(!strncmp(bufUSB, "start", 5)){
	    		for(i = 0; i < 6; i++){
	    			if(activePipes[i]){
	    				RF24send("start", 5, i);
						HAL_Delay(1);
	    			}
	    		}
	    		/*
	    		RF24enablePipe(0);
	    		RF24enablePipe(1);
	    		RF24enablePipe(2);
	    		RF24enablePipe(3);
	    		RF24enablePipe(4);
	    		RF24enablePipe(5);

	    		RF24send("start", 5, 0);
	    		HAL_Delay(1);
	    		RF24send("start", 5, 1);
	    		HAL_Delay(1);
	    		RF24send("start", 5, 2);
	    		HAL_Delay(1);
	    		RF24send("start", 5, 3);
	    		HAL_Delay(1);
	    		RF24send("start", 5, 4);
	    		HAL_Delay(1);
	    		RF24send("start", 5, 5);
	    		*/
	    	}

	    	else if(!strncmp(bufUSB, "pipe", 4)){    //Check if it's a message to the pipe
                _pipe = atoi(bufUSB+4);   				//Get the destination pipe
                bufUSB[indexUSB] = '\0';                //Ignores the next received USB
                indexAux = indexUSB;

                if(!strncmp((char*)(bufUSB + 6), "stop", 4)){   //Check if the message is a 'stop' message
                	flushCounter++;
                	if(flushCounter>3){
                		RF24Flush();
                		flushCounter = 1;
                	}
                	//while(RF24fullTX());
                	RF24sendInTheNextReceive((char*)(bufUSB+6), indexAux - 6, _pipe);    //Send 'stop' in the next reception
                	//CDC_Transmit_FS("ok\r\n", 4);
                }
                else{                                           //Check if the message isn't a 'stop' message
                    RF24send(bufUSB + 6, indexAux - 6, _pipe);  //Send the message
                	//RF24send("blink", 5, 1);  //Send the message
                    //CDC_Transmit_FS(bufUSB, indexUSB);
                }
            }
            else if(!strncmp((char *)bufUSB, "enablePipe", 10)){    //Check if it's required to enable a pipe
            	activePipes[atoi((const char*)(bufUSB + 10))] = true;
                RF24enablePipe(atoi((const char*)(bufUSB + 10)));   //Enable the required pipe
            }
            else if(!strncmp((char *)bufUSB, "disablePipe", 11)){   //Check if it's required to disable a pipe
            	activePipes[atoi((const char*)(bufUSB + 10))] = false;
                RF24disablePipe(atoi((const char*)(bufUSB + 11)));  //Disable the required pipe
            }
            else if(!strncmp((char *)bufUSB, "digital", 7)){   //Change to digital mode
				mode = DIGITAL;
			}
            else if(!strncmp((char *)bufUSB, "analog", 6)){   //Change to analog mode
				mode = ANALOG;
			}
            indexUSB = 0;       //Reset the index USB buffer
            bufUSB[0] = '\0';   //Reset the USB buffer
        }
    }
}
