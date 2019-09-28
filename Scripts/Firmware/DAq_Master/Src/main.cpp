/**
 ******************************************************************************
 * @file           : main.c
 * @brief          : Main program body
 ******************************************************************************
 * This notice applies to any and all portions of this file
 * that are not between comment pairs USER CODE BEGIN and
 * USER CODE END. Other portions of this file, whether
 * inserted by the user or by software development tools
 * are owned by their respective copyright owners.
 *
 * Copyright (c) 2018 STMicroelectronics International N.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted, provided that the following conditions are met:
 *
 * 1. Redistribution of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of STMicroelectronics nor the names of other
 *    contributors to this software may be used to endorse or promote products
 *    derived from this software without specific written permission.
 * 4. This software, including modifications and/or derivative works of this
 *    software, must execute solely and exclusively on microcontroller or
 *    microprocessor devices manufactured by or for STMicroelectronics.
 * 5. Redistribution and use of this software other than as permitted under
 *    this license is void and will automatically terminate your rights under
 *    this license.
 *
 * THIS SOFTWARE IS PROVIDED BY STMICROELECTRONICS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS, IMPLIED OR STATUTORY WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NON-INFRINGEMENT OF THIRD PARTY INTELLECTUAL PROPERTY
 * RIGHTS ARE DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY LAW. IN NO EVENT
 * SHALL STMICROELECTRONICS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 ******************************************************************************
 */
/* Includes ------------------------------------------------------------------*/

#include "main.h"
#include "stm32f1xx_hal.h"
#include "usb_device.h"
#include <vector>

/* USER CODE BEGIN Includes */
#include <stdlib.h>
#include "../../Bibliotecas/nRF24L01.cpp"
#include "usbd_cdc_if.h"

/* USER CODE END Includes */

/* Private variables ---------------------------------------------------------*/
SPI_HandleTypeDef hspi1;

TIM_HandleTypeDef htim3;

/* USER CODE BEGIN PV */
/* Private variables ---------------------------------------------------------*/

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_SPI1_Init(void);
static void MX_TIM3_Init(void);

/* USER CODE BEGIN PFP */
/* Private function prototypes -----------------------------------------------*/

/* USER CODE END PFP */

/* USER CODE BEGIN 0 */
#define DIGITAL 0
#define ANALOG 1

bool mode = ANALOG;
unsigned int indexUSB;
char bufUSB[100];

void sendThroughUSB(char* buf, int radioIndex, int pipe) {
	uint8_t pipeData[100];  //Buffer with data received + pipe

	//sprintf((char *) pipeData, "r%d,p%d:", radioIndex, pipe); //Insert pipe
	pipeData[0] = ((radioIndex & 0xF)<<4) | (pipe & 0xF);

	if (mode == DIGITAL) {
		pipeData[1] = buf[0];           //Acx
		pipeData[2] = buf[1];           //^
		pipeData[3] = buf[2];           //Acy
		pipeData[4] = buf[3];          //^
		pipeData[5] = buf[4];          //Acz
		pipeData[6] = buf[5];          //^
		pipeData[7] = buf[6];          //Battery level
		pipeData[8] = buf[7];          //Milliseconds
		pipeData[9] = buf[8];          //^
		pipeData[10] = buf[9];          //^
		pipeData[11] = buf[10];         //^
		CDC_Transmit_FS(pipeData, 12);      //Transmit data through USB
	} else {
		for(uint8_t i = 0; i<30; i++){
			pipeData[i+1] = buf[i];
		}
		CDC_Transmit_FS(pipeData, 31);      //Transmit data through USB
	}
}

void testLEDs() {
	HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED8_GPIO_Port, LED8_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED8_GPIO_Port, LED8_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin, GPIO_PIN_SET);
	HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_RESET);
	HAL_Delay(50);
	HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_SET);
}

void toggleLED(uint8_t led) {
	switch (led) {
	case 1:
		HAL_GPIO_TogglePin(LED1_GPIO_Port, LED1_Pin);
		break;
	case 2:
		HAL_GPIO_TogglePin(LED2_GPIO_Port, LED2_Pin);
		break;
	case 3:
		HAL_GPIO_TogglePin(LED3_GPIO_Port, LED3_Pin);
		break;
	case 4:
		HAL_GPIO_TogglePin(LED4_GPIO_Port, LED4_Pin);
		break;
	case 5:
		HAL_GPIO_TogglePin(LED5_GPIO_Port, LED5_Pin);
		break;
	case 6:
		HAL_GPIO_TogglePin(LED6_GPIO_Port, LED6_Pin);
		break;
	case 7:
		HAL_GPIO_TogglePin(LED7_GPIO_Port, LED7_Pin);
		break;
	case 8:
		HAL_GPIO_TogglePin(LED8_GPIO_Port, LED8_Pin);
		break;
	}
}

/* USER CODE END 0 */

/**
 * @brief  The application entry point.
 *
 * @retval None
 */
int main(void) {
	/* USER CODE BEGIN 1 */

	/* USER CODE END 1 */

	/* MCU Configuration----------------------------------------------------------*/

	/* Reset of all peripherals, Initializes the Flash interface and the Systick. */
	HAL_Init();

	/* USER CODE BEGIN Init */

	/* USER CODE END Init */

	/* Configure the system clock */
	SystemClock_Config();

	/* USER CODE BEGIN SysInit */

	/* USER CODE END SysInit */

	/* Initialize all configured peripherals */
	MX_GPIO_Init();
	MX_SPI1_Init();
	MX_USB_DEVICE_Init();
	MX_TIM3_Init();
	/* USER CODE BEGIN 2 */
	HAL_Delay(200);

	testLEDs();

	char RF24buf[100];      //Buffer to receive data from nRF24
	int _radio = 0, _pipe;      		//Var to store the data's last pipe
	unsigned int indexAux;
	volatile bool started = false;
	bool activesRadios[] = {false, false, false, true, false, false, false, false};

	std::vector<nRF24> radio = { { &hspi1, 31, 30, 5 }, { &hspi1, 29, 28, 10 },
			{ &hspi1, 27, 26, 15 }, { &hspi1, 25, 22, 20 },
			{ &hspi1, 10, 11, 25 }, { &hspi1, 12, 13, 30 },
			{ &hspi1, 14, 18, 35 }, { &hspi1, 19, 21, 40 } };

	// uint8_t rf[100];
	// uint32_t sampleCounter = 0;

	// while(1){
	// 	if(radio[3].available()){
	// 		radio[3].read((char *)rf);
	// 		/*sampleCounter = (rf[8] & 0xff);				//SampleCounter
	// 		sampleCounter += ((rf[9])<<8);		//^
	// 		sampleCounter += ((rf[10])<<16);	//^
	// 		sampleCounter += ((rf[11])<<24);	//^
	// 		sprintf(RF24buf, "%d", sampleCounter);
	// 		CDC_Transmit_FS((uint8_t *)RF24buf, strlen(RF24buf));
	// 		*/
	// 		CDC_Transmit_FS((uint8_t *)rf, strlen((char*)rf));
	// 	}
	// }

	while (1) {
		//Config routine
		while (!started) {
			if (indexUSB) {
				if (!strncmp((char *) bufUSB, "enablePipe", 10)) { //Check if it's required to enable a pipe
					_radio = atoi((const char*) (bufUSB + 11));
					radio[_radio].activePipes[atoi((const char*) (bufUSB + 13))] =
							true;
					radio[_radio].enablePipe(atoi((const char*) (bufUSB + 13))); //Enable the required pipe
				} else if (!strncmp((char *) bufUSB, "disablePipe", 11)) { //Check if it's required to disable a pipe
					_radio = atoi((const char*) (bufUSB + 12));
					radio[_radio].activePipes[atoi((const char*) (bufUSB + 14))] =
							false;
					radio[_radio].disablePipe(
							atoi((const char*) (bufUSB + 14))); //Disable the required pipe
				} else if (!strncmp((char *) bufUSB, "digital", 7)) { //Change to digital mode
					mode = DIGITAL;
				} else if (!strncmp((char *) bufUSB, "analog", 6)) { //Change to analog mode
					mode = ANALOG;
				} else if (!strncmp(bufUSB, "start", 5)) {
					testLEDs();
					started = true;
					for (int j = 0; j < 8; j++) {
						for (int k = 0; k < 6; k++) {
							if (radio[j].activePipes[k]) {
								radio[j].send("start", 5, k);
								HAL_Delay(1);
							}
						}
					}
				} else {
					_radio = atoi(bufUSB + 1);   //Get the destination pipe
					toggleLED(_radio + 1);
					_pipe = atoi(bufUSB + 3);   //Get the destination pipe
					bufUSB[indexUSB] = '\0'; //Ignores the next received USB
					indexAux = indexUSB;

					radio[_radio].send(bufUSB + 5, indexAux - 5, _pipe); //Send the message
					HAL_Delay(100);
					toggleLED(_radio + 1);
				}

				indexUSB = 0;       //Reset the index USB buffer
				bufUSB[0] = '\0';   //Reset the USB buffer
			}

		}

		//Receive routine
		while (started) {
			for (int i = 0; i < 8; i++) {
				if(activesRadios[i]){
					if (radio[i].available()) {
						_pipe = radio[i].available() - 1;
						switch (i) {
						case 0:
							HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_SET);
							break;
						case 1:
							HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin,
									GPIO_PIN_SET);
							break;
						case 2:
							HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin,
									GPIO_PIN_SET);
							break;
						case 3:
							 HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin,
							 		GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							 sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED4_GPIO_Port, LED4_Pin,
							 		GPIO_PIN_SET);
							break;
						case 4:
							HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED5_GPIO_Port, LED5_Pin,
									GPIO_PIN_SET);
							break;
						case 5:
							HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED6_GPIO_Port, LED6_Pin,
									GPIO_PIN_SET);
							break;
						case 6:
							HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED7_GPIO_Port, LED7_Pin,
									GPIO_PIN_SET);
							break;
						case 7:
							HAL_GPIO_WritePin(LED8_GPIO_Port, LED8_Pin,
									GPIO_PIN_RESET);
							radio[i].read(RF24buf);
							sendThroughUSB(RF24buf, i, _pipe);
							HAL_GPIO_WritePin(LED8_GPIO_Port, LED8_Pin,
									GPIO_PIN_SET);
							break;
						}
					}
				}
				if (indexUSB) {                  //If there's available USB data
					if (!strncmp((char*) bufUSB, "stop", 4)) { //Check if the message is a 'stop' message
						started = false;
						radio[_radio].Flush();
						for (int j = 0; j < 8; j++) {
							if(activesRadios[j]){
								for (int k = 0; k < 6; k++) {
									if (radio[j].activePipes[k]) {
										radio[j].sendInTheNextReceive("stop", 4, k);
										HAL_Delay(5);
									}
								}
							}
						}
					} else {   //Check if the message isn't a 'stop' message
						_radio = atoi(bufUSB + 1);   //Get the destination pipe
						_pipe = atoi(bufUSB + 3);   //Get the destination pipe
						bufUSB[indexUSB] = '\0'; //Ignores the next received USB
						indexAux = indexUSB;

						radio[_radio].send(bufUSB + 5, indexAux - 5, _pipe); //Send the message
					}
					indexUSB = 0;       //Reset the index USB buffer
					bufUSB[0] = '\0';   //Reset the USB buffer
				}
			}
		}
	}

	/* USER CODE END 2 */

	/* Infinite loop */
	/* USER CODE BEGIN WHILE */
	while (1) {

		/* USER CODE END WHILE */

		/* USER CODE BEGIN 3 */
		radio[0].send("teste\r\n", 7, 0);
		HAL_GPIO_TogglePin(LED1_GPIO_Port, LED1_Pin);
		HAL_Delay(250);

	}
	/* USER CODE END 3 */

}

/**
 * @brief System Clock Configuration
 * @retval None
 */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};
  RCC_PeriphCLKInitTypeDef PeriphClkInit = {0};

  /** Initializes the CPU, AHB and APB busses clocks
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }
  /** Initializes the CPU, AHB and APB busses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
  PeriphClkInit.PeriphClockSelection = RCC_PERIPHCLK_USB;
  PeriphClkInit.UsbClockSelection = RCC_USBCLKSOURCE_PLL_DIV1_5;
  if (HAL_RCCEx_PeriphCLKConfig(&PeriphClkInit) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief SPI1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_SPI1_Init(void)
{

  /* USER CODE BEGIN SPI1_Init 0 */

  /* USER CODE END SPI1_Init 0 */

  /* USER CODE BEGIN SPI1_Init 1 */

  /* USER CODE END SPI1_Init 1 */
  /* SPI1 parameter configuration*/
  hspi1.Instance = SPI1;
  hspi1.Init.Mode = SPI_MODE_MASTER;
  hspi1.Init.Direction = SPI_DIRECTION_2LINES;
  hspi1.Init.DataSize = SPI_DATASIZE_8BIT;
  hspi1.Init.CLKPolarity = SPI_POLARITY_LOW;
  hspi1.Init.CLKPhase = SPI_PHASE_1EDGE;
  hspi1.Init.NSS = SPI_NSS_SOFT;
  hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_8;
  hspi1.Init.FirstBit = SPI_FIRSTBIT_MSB;
  hspi1.Init.TIMode = SPI_TIMODE_DISABLE;
  hspi1.Init.CRCCalculation = SPI_CRCCALCULATION_DISABLE;
  hspi1.Init.CRCPolynomial = 10;
  if (HAL_SPI_Init(&hspi1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN SPI1_Init 2 */

  /* USER CODE END SPI1_Init 2 */

}

/**
  * @brief TIM3 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM3_Init(void)
{

  /* USER CODE BEGIN TIM3_Init 0 */

  /* USER CODE END TIM3_Init 0 */

  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};

  /* USER CODE BEGIN TIM3_Init 1 */

  /* USER CODE END TIM3_Init 1 */
  htim3.Instance = TIM3;
  htim3.Init.Prescaler = 0;
  htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim3.Init.Period = 0;
  htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim3, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim3, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN TIM3_Init 2 */

  /* USER CODE END TIM3_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOD_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOA, CE5_Pin|CE6_Pin|CE7_Pin|CE2_Pin
                          |CE1_Pin|LED1_Pin, GPIO_PIN_SET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOA, CS5_Pin|CS6_Pin|CS1_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOB, CS7_Pin|CS8_Pin|CS4_Pin|CS3_Pin
                          |CS2_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOB, CE8_Pin|CE4_Pin|CE3_Pin|LED2_Pin
                          |LED3_Pin|LED4_Pin|LED5_Pin|LED6_Pin
                          |LED7_Pin|LED8_Pin, GPIO_PIN_SET);

  /*Configure GPIO pins : CE5_Pin CS5_Pin CE6_Pin CS6_Pin
                           CE7_Pin CE2_Pin CS1_Pin CE1_Pin
                           LED1_Pin */
  GPIO_InitStruct.Pin = CE5_Pin|CS5_Pin|CE6_Pin|CS6_Pin
                          |CE7_Pin|CE2_Pin|CS1_Pin|CE1_Pin
                          |LED1_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pins : CS7_Pin CE8_Pin CS8_Pin CS4_Pin
                           CE4_Pin CS3_Pin CE3_Pin CS2_Pin
                           LED2_Pin LED3_Pin LED4_Pin LED5_Pin
                           LED6_Pin LED7_Pin LED8_Pin */
  GPIO_InitStruct.Pin = CS7_Pin|CE8_Pin|CS8_Pin|CS4_Pin
                          |CE4_Pin|CS3_Pin|CE3_Pin|CS2_Pin
                          |LED2_Pin|LED3_Pin|LED4_Pin|LED5_Pin
                          |LED6_Pin|LED7_Pin|LED8_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

}
/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
 * @brief  This function is executed in case of error occurrence.
 * @param  file: The file name as string.
 * @param  line: The line in file as a number.
 * @retval None
 */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */

  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
 * @brief  Reports the name of the source file and the source line number
 *         where the assert_param error has occurred.
 * @param  file: pointer to the source file name
 * @param  line: assert_param error line source number
 * @retval None
 */
void assert_failed(uint8_t* file, uint32_t line)
{
	/* USER CODE BEGIN 6 */
	/* User can add his own implementation to report the file name and line number,
	 tex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
	/* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */

/**
 * @}
 */

/**
 * @}
 */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
