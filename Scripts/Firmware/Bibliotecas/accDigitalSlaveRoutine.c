/*Import external global variables*/
//ADC and ADC_DMA module
extern ADC_HandleTypeDef hadc1;
extern DMA_HandleTypeDef hdma_adc1;
//SPI module
extern SPI_HandleTypeDef hspi1;
extern SPI_HandleTypeDef hspi2;
//Timers 1 and 2 modules
extern TIM_HandleTypeDef htim1;
extern TIM_HandleTypeDef htim2;

extern uint8_t sampleTimer;     //Timer variable to perform a continuous sample frequency
extern uint32_t millis;         //Var that stores the elapsed aquire time (ms)

void setNodeAdress(uint8_t node);   //Function that switch between node addresses

void digitalSlaveRoutine(uint8_t node, uint8_t channel, float ADCconstant){

	uint8_t _dat[12], samplePrescaler = 2;      //_dat stores the total node data and samplePrescaler prescales the sample rate
	uint32_t millisNow, batteryLevel = 2720;    //millisNow stores the exact time when the acc data is available

    char messageReceived[100];                  //Var that receive message from nRF24
    bool send = false;                          //Flag that sets when the routine should switch from 'idle' to 'send' mode

    uint8_t var[5];

    struct inteiro acc;     //Init the acc data variable

    acel_init(16, &hspi1, 14);  //Initi the ADXL345
    acc.X = 0;                  //Clear its vars
    acc.Y = 0;                  //
    acc.Z = 0;                  //
    /**/

    HAL_Delay(500);   //Waits for nRF24 initialization
    RF24init(&hspi2, 30, 25, channel);  //Init nRF24

    setNodeAdress(node);    //Changes the node addresses depending on which node it is

    /*Blinks 3 times when the nodes starts*/
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_3, 0);
    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 1);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(Led_GPIO_Port, Led_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(Led_GPIO_Port, Led_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(Led_GPIO_Port, Led_Pin);
    HAL_Delay(200);
    HAL_GPIO_TogglePin(Led_GPIO_Port, Led_Pin);
    HAL_Delay(200);
    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 0);

    readRegisterManyTimes(RX_ADDR_P0, messageReceived, 5);
    readRegisterManyTimes(RX_ADDR_P1, messageReceived, 5);
    readRegisterManyTimes(RX_ADDR_P2, messageReceived, 5);
    readRegisterManyTimes(RX_ADDR_P3, messageReceived, 5);
    readRegisterManyTimes(RX_ADDR_P4, messageReceived, 5);
    readRegisterManyTimes(RX_ADDR_P5, messageReceived, 5);

    /*Loop*/
    while(1){
        if(sampleTimer >= samplePrescaler){     //Check if it's time to send data
            sampleTimer = 0;    //Reset the timer flag

            acc = acel_burst_read();        //Read acc
            millisNow = millis;             //Get the current time
            _dat[0] = (acc.X>>8) & 0x00FF;  //Stores Acx
            _dat[1] = acc.X & 0x00FF;       //^
            _dat[2] = (acc.Y>>8) &0x00FF;   //Stores Acy
            _dat[3] = acc.Y & 0x00FF;       //^
            _dat[4] = (acc.Z>>8) &0x00FF;   //Stores Acz
            _dat[5] = acc.Z & 0x00FF;       //^
            _dat[6] = 50*ADCconstant*((float)(batteryLevel)); //Stores the battery level and send it as (uint8_t)(B[volt]*100/2)
            _dat[7] = 0xFF & (millisNow>>24);   //Stores the time (ms)
            _dat[8] = 0xFF & (millisNow>>16);   //^
            _dat[9] = 0xFF & (millisNow>>8);    //^
            _dat[10] = 0xFF & (millisNow);      //^

            if(RF24send(_dat, 11, 0)){          //Send the data and check for any ACK package
                RF24read(messageReceived);      //Read the ACK package
                if(strncmp(messageReceived, "stop", 4) == 0){   //Check for a 'stop' message
                    HAL_TIM_Base_Stop_IT(&htim2);   //Stops the 'send' timer
                    HAL_ADC_Stop_DMA(&hadc1);       //Stops the battery level read
                    send = false;                   //Returns to 'idle' mode

                    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 1);		//v
					HAL_Delay(100);										//Blink for 100ms to confirm the stop
					HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 0);		//^

                }
            }

            //HAL_GPIO_TogglePin(Led_GPIO_Port, Led_Pin);   //Just for debug
	    }
        else if(!send){     //If the node isn't at 'idle' mode
            if(RF24available()){    //Check if there's any available nRF24 message
                RF24read(messageReceived);  //Get the message
                if(strncmp(messageReceived, "blink", 5) == 0){  //Check if is required to perform 'blink'
                    HAL_TIM_Base_Start_IT(&htim1);              //Starts timer to 'blink' the node
                }
                else if(strncmp(messageReceived, "!blink", 6) == 0){    //Check if is required to stop 'blink'
                    HAL_TIM_Base_Stop_IT(&htim1);                       //Stops 'blink' timer
                    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 0);       //Turn off the led
                }
                else if(strncmp(messageReceived, "start", 5) == 0){     //Check if it's required to start the aquisition

                	HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 1);		//v
					HAL_Delay(100);										//Blink for 100ms to confirm the start
					HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 0);		//^

                	HAL_TIM_Base_Start_IT(&htim2);                      //Starts the 'send' timer
                    HAL_ADC_Start_DMA(&hadc1, &batteryLevel, 1);        //Starts the battery level read
                    send = true;    //Goes to 'send' mode
                    millis = 0;     //Reset ms counter
                }
                else if(messageReceived[0] == 'f'){     //Check if it's required to change sample rate
                    switch(atoi((const char*)(messageReceived + 1))){   //Get the new sample rate
                        case 125:   //if the sample rate is 125
                            samplePrescaler = 8;    //Set timer prescale to 8
                            break;
                        case 250:   //if the sample rate is 250
                            samplePrescaler = 4;    //Set timer prescale to 4
                            break;
                        case 500:   //if the sample rate is 500
                            samplePrescaler = 2;    //Set timer prescale to 2
                            break;
                    }
                    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 1);		//v
                    HAL_Delay(100);										//Blink for 100ms to confirm the change
                    HAL_GPIO_WritePin(Led_GPIO_Port, Led_Pin, 0);		//^
                }
            }
        }
    }
}

void setNodeAdress(uint8_t node){
    /*Default addresses from nRF24 library*/
    unsigned int _defaultAddressPipe0[5] = {0x10, 0x10, 0x10, 0x10, 0x10};
    unsigned int _defaultAddressPipe1[5] = {0x11, 0x10, 0x10, 0x10, 0x11};
    unsigned int _defaultAddressPipe2[5] = {0x11, 0x10, 0x10, 0x10, 0x12};
    unsigned int _defaultAddressPipe3[5] = {0x11, 0x10, 0x10, 0x10, 0x13};
    unsigned int _defaultAddressPipe4[5] = {0x11, 0x10, 0x10, 0x10, 0x14};
    unsigned int _defaultAddressPipe5[5] = {0x11, 0x10, 0x10, 0x10, 0x15};
    unsigned int _fooAdress[5] = {0xBB, 0xBB, 0xBB, 0xBB, 0xBB};    //Foo address

    /*Deactivate all node pipes but pipe 0*/
    RF24attrAddress2Pipe1(_fooAdress);
    RF24attrAddress2Pipe2(_fooAdress[4]);
    RF24attrAddress2Pipe3(_fooAdress[4]);
    RF24attrAddress2Pipe4(_fooAdress[4]);
    RF24attrAddress2Pipe5(_fooAdress[4]);

    RF24disablePipe(1);
    RF24disablePipe(2);
    RF24disablePipe(3);
    RF24disablePipe(4);
    RF24disablePipe(5);

	RF24SetRetries(15, 3000);

    /*Set the node's pipe0 address to master's pipeX address*/
    switch (node)
    {
        case 1:
            RF24attrAddress2Pipe0(_defaultAddressPipe1);
		RF24SetRetries(15, 1750);
            break;
        case 2:
            RF24attrAddress2Pipe0(_defaultAddressPipe2);
		RF24SetRetries(15, 2000);
            break;
        case 3:
            RF24attrAddress2Pipe0(_defaultAddressPipe3);
		RF24SetRetries(15, 2250);
            break;
        case 4:
            RF24attrAddress2Pipe0(_defaultAddressPipe4);
		RF24SetRetries(15, 2500);
            break;
        case 5:
            RF24attrAddress2Pipe0(_defaultAddressPipe5);
		RF24SetRetries(15, 2750);
            break;
        default:
            break;
    }
    /*
    readRegisterManyTimes(RX_ADDR_P0, _fooAdress, 5);
    readRegisterManyTimes(RX_ADDR_P1, _fooAdress, 5);
    readRegisterManyTimes(RX_ADDR_P2, _fooAdress, 5);
    readRegisterManyTimes(RX_ADDR_P3, _fooAdress, 5);
    readRegisterManyTimes(RX_ADDR_P4, _fooAdress, 5);
    readRegisterManyTimes(RX_ADDR_P5, _fooAdress, 5);
    */
}
