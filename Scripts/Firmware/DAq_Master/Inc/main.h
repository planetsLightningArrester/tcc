/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.h
  * @brief          : Header for main.c file.
  *                   This file contains the common defines of the application.
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2019 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under Ultimate Liberty license
  * SLA0044, the "License"; You may not use this file except in compliance with
  * the License. You may obtain a copy of the License at:
  *                             www.st.com/SLA0044
  *
  ******************************************************************************
  */
/* USER CODE END Header */

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
#include "stm32f1xx_hal.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Exported types ------------------------------------------------------------*/
/* USER CODE BEGIN ET */

/* USER CODE END ET */

/* Exported constants --------------------------------------------------------*/
/* USER CODE BEGIN EC */

/* USER CODE END EC */

/* Exported macro ------------------------------------------------------------*/
/* USER CODE BEGIN EM */

/* USER CODE END EM */

/* Exported functions prototypes ---------------------------------------------*/
void Error_Handler(void);

/* USER CODE BEGIN EFP */

/* USER CODE END EFP */

/* Private defines -----------------------------------------------------------*/
#define CS8_Pin GPIO_PIN_0
#define CS8_GPIO_Port GPIOA
#define CE8_Pin GPIO_PIN_1
#define CE8_GPIO_Port GPIOA
#define CS7_Pin GPIO_PIN_2
#define CS7_GPIO_Port GPIOA
#define CE7_Pin GPIO_PIN_3
#define CE7_GPIO_Port GPIOA
#define CS6_Pin GPIO_PIN_4
#define CS6_GPIO_Port GPIOA
#define CE6_Pin GPIO_PIN_0
#define CE6_GPIO_Port GPIOB
#define CS5_Pin GPIO_PIN_1
#define CS5_GPIO_Port GPIOB
#define CE5_Pin GPIO_PIN_10
#define CE5_GPIO_Port GPIOB
#define CE1_Pin GPIO_PIN_11
#define CE1_GPIO_Port GPIOB
#define CS1_Pin GPIO_PIN_12
#define CS1_GPIO_Port GPIOB
#define CE2_Pin GPIO_PIN_13
#define CE2_GPIO_Port GPIOB
#define CS2_Pin GPIO_PIN_14
#define CS2_GPIO_Port GPIOB
#define CE3_Pin GPIO_PIN_15
#define CE3_GPIO_Port GPIOB
#define CS3_Pin GPIO_PIN_8
#define CS3_GPIO_Port GPIOA
#define CE4_Pin GPIO_PIN_9
#define CE4_GPIO_Port GPIOA
#define CS4_Pin GPIO_PIN_10
#define CS4_GPIO_Port GPIOA
#define LED1_Pin GPIO_PIN_15
#define LED1_GPIO_Port GPIOA
#define LED2_Pin GPIO_PIN_3
#define LED2_GPIO_Port GPIOB
#define LED3_Pin GPIO_PIN_4
#define LED3_GPIO_Port GPIOB
#define LED4_Pin GPIO_PIN_5
#define LED4_GPIO_Port GPIOB
#define LED5_Pin GPIO_PIN_6
#define LED5_GPIO_Port GPIOB
#define LED6_Pin GPIO_PIN_7
#define LED6_GPIO_Port GPIOB
#define LED7_Pin GPIO_PIN_8
#define LED7_GPIO_Port GPIOB
#define LED8_Pin GPIO_PIN_9
#define LED8_GPIO_Port GPIOB
/* USER CODE BEGIN Private defines */

/* USER CODE END Private defines */

#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
