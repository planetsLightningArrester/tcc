/*
CH1: 17.67V->2.98V
CH2: 17.69V->2.93V
CH3: 17.66V->2.88V
CH4: 17.66V->2.93V

CH1: 0.047631103515625
CH2: 0.0485146484375
CH3: 0.04925361328125
CH4: 0.0484102294921875

*/
extern ADC_HandleTypeDef hadc1;
extern DMA_HandleTypeDef hdma_adc1;

extern SPI_HandleTypeDef hspi2;

extern TIM_HandleTypeDef htim1;
extern TIM_HandleTypeDef htim2;

extern volatile unsigned int adcConvertionComplete;
extern uint32_t ADCReadings[2];
extern uint16_t acc1ZeroValue, acc2ZeroValue, acc3ZeroValue, acc4ZeroValue;

extern uint8_t sampleTimer;     //Timer variable to perform a continuous sample frequency

void setNodeAdress(uint8_t node); //Function that switch between node addresses

void accAnalogSlaveRoutine(uint8_t node, uint8_t channel, float ADCconstant1, float ADCconstant2, float ADCconstant3, float ADCconstant4) {
    double ACC[4];
    uint8_t i, j;
    uint32_t sampleCounter = 0;
    uint32_t samplePrescaler = 1;
    bool channelsActives[4] = {true, false, false, false};
    bool digitalFilterActive = false;
    bool send = false;

    uint8_t msgBuffer[32];
    uint16_t msgBufferAux;
    char messageReceived[32];

    HAL_Delay(500);
    RF24init(&hspi2, 29, 25, channel);

    setNodeAdress(node); //Changes the node addresses depending on which node it is

    HAL_GPIO_WritePin(idleLed_GPIO_Port, idleLed_Pin, 1);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
    HAL_Delay(200);
    HAL_GPIO_WritePin(idleLed_GPIO_Port, idleLed_Pin, 0);
    HAL_Delay(200);
/*
    while(1){
    	sprintf(messageReceived, "%d\r\n\0", sampleCounter++);
    	RF24send(messageReceived, strlen(messageReceived), 0);
    	//HAL_Delay(100);
    	HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
    }*/

/*
    HAL_TIM_Base_Start_IT(&htim2);
    HAL_ADC_Start_DMA(&hadc1, (uint32_t * ) ADCReadings, 4);
    calibrationRoutine();
    send = true;
*/
    //sampleTimer = 10;
    /*Loop*/
    while (1) {
        if (sampleTimer >= samplePrescaler) {
            sampleTimer = 0;
            if(!digitalFilterActive){
            	sampleCounter++;
                adcConvertionComplete = 0;

                ACC[0] = ADCReadings[0]&0xffff;
				ACC[1] = (ADCReadings[0]&0xffff0000)>>16;
				ACC[2] = ADCReadings[1]&0xffff;
				ACC[3] = (ADCReadings[1]&0xffff0000)>>16;

				ACC[0] = (ACC[0] - acc1ZeroValue)*ADCconstant1;
				ACC[1] = (ACC[1] - acc2ZeroValue)*ADCconstant2;
				ACC[2] = (ACC[2] - acc3ZeroValue)*ADCconstant3;
				ACC[3] = (ACC[3] - acc4ZeroValue)*ADCconstant4;

				for(i = 0, j = 0; i < 4; i++){
					if(channelsActives[i]){
						msgBufferAux = (ACC[0]+50)/0.05;
						msgBuffer[j] = (msgBufferAux>>8) & 0x07;
						j++;
						msgBuffer[j] = msgBufferAux & 0xFF;
						j++;
					}
					else{
						msgBuffer[j] = (1000>>8) & 0x07;
						j++;
						msgBuffer[j] = 1000 & 0xFF;
						j++;
					}
				}
				msgBuffer[8] = (sampleCounter>>24) & 0xFF;
				msgBuffer[9] = (sampleCounter>>16) & 0xFF;
				msgBuffer[10] = (sampleCounter>>8) & 0xFF;
				msgBuffer[11] = sampleCounter & 0xFF;

                if(RF24send(msgBuffer, 11, 0)){          //Send the data and check for any ACK package
                    RF24read(messageReceived);      //Read the ACK package
                    if(strncmp(messageReceived, "stop", 4) == 0){   //Check for a 'stop' message
                        HAL_TIM_Base_Stop_IT(&htim2);   //Stops the 'send' timer
                        HAL_ADC_Stop_DMA(&hadc1);       //Stops the battery level read
                        send = false;                   //Returns to 'idle' mode

                        HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 1);		//v
						HAL_Delay(100);										        //Blink for 100ms to confirm the change
						HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);		//^
						sampleTimer = 0;
                    }
                }

                HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);

            }
            else{

            }
        }
        else if (!send) {
            if (RF24available()) {
                HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);

                RF24read(messageReceived);

                if (strncmp(messageReceived, "blink", 5) == 0) {
                    HAL_TIM_Base_Start_IT(&htim1);
                    HAL_GPIO_WritePin(idleLed_GPIO_Port, idleLed_Pin, 1);
                }
                else if (strncmp(messageReceived, "!blink", 6) == 0) {
                    HAL_TIM_Base_Stop_IT(&htim1);
                    HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);
                    HAL_GPIO_WritePin(idleLed_GPIO_Port, idleLed_Pin, 1);
                }
                else if (strncmp(messageReceived, "start", 5) == 0) {
                	HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 1);		//v
					HAL_Delay(100);										        //Blink for 100ms to confirm the change
					HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);		//^

                    HAL_TIM_Base_Start_IT(&htim2);
                    HAL_ADC_Start_DMA(&hadc1, (uint32_t * ) ADCReadings, 4);
                    calibrationRoutine();
                    send = true;

					//sampleTimer = 10;
                }
                else if(strncmp(messageReceived, "filter", 6) == 0){
                    digitalFilterActive = atoi((const char*)(messageReceived + 6));

                    HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 1);		//v
					HAL_Delay(100);										        //Blink for 100ms to confirm the change
					HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);		//^
                }
                else if(strncmp(messageReceived, "channelOn", 9) == 0){
                    channelsActives[atoi((const char*)(messageReceived + 9))] = true;

                    HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 1);		//v
					HAL_Delay(100);										        //Blink for 100ms to confirm the change
					HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);		//^
                }
                else if(strncmp(messageReceived, "channelOff", 10) == 0){
                    channelsActives[atoi((const char*)(messageReceived + 10))] = false;

                    HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 1);		//v
					HAL_Delay(100);										        //Blink for 100ms to confirm the change
					HAL_GPIO_WritePin(sendLed_GPIO_Port, sendLed_Pin, 0);		//^
                }

                HAL_GPIO_TogglePin(idleLed_GPIO_Port, idleLed_Pin);
            }
        }
    }
}

void setNodeAdress(uint8_t node){
    /*Default addresses from nRF24 library*/
    unsigned int _defaultAddressPipe0[6] = {0x10, 0x10, 0x10, 0x10, 0x10};
    unsigned int _defaultAddressPipe1[6] = {0x11, 0x10, 0x10, 0x10, 0x11};
    unsigned int _defaultAddressPipe2[6] = {0x11, 0x10, 0x10, 0x10, 0x12};
    unsigned int _defaultAddressPipe3[6] = {0x11, 0x10, 0x10, 0x10, 0x13};
    unsigned int _defaultAddressPipe4[6] = {0x11, 0x10, 0x10, 0x10, 0x14};
    unsigned int _defaultAddressPipe5[6] = {0x11, 0x10, 0x10, 0x10, 0x15};
    unsigned int _fooAdress[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF};    //Foo address

    /*Deactivate all node pipes but pipe 0*/
    RF24attrAddress2Pipe1(_fooAdress);
    RF24attrAddress2Pipe2(_fooAdress[4]);
    RF24attrAddress2Pipe3(_fooAdress[4]);
    RF24attrAddress2Pipe4(_fooAdress[4]);
    RF24attrAddress2Pipe5(_fooAdress[4]);
    
    /*Set the node's pipe0 address to master's pipeX address*/
    switch (node)
    {
        case 1:
            RF24attrAddress2Pipe0(_defaultAddressPipe1);
            break;
        case 2:
            RF24attrAddress2Pipe0(_defaultAddressPipe2);
            break;
        case 3:
            RF24attrAddress2Pipe0(_defaultAddressPipe3);
            break;
        case 4:
            RF24attrAddress2Pipe0(_defaultAddressPipe4);
            break;
        case 5:
            RF24attrAddress2Pipe0(_defaultAddressPipe5);
            break;
        default:
            break;
    }
}
