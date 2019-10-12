/*Criado por Geraldo Pugialli - Kotchergenko Engenharia 2018*/

#include "stm32f1xx_hal.h"

#include "stdlib.h"
#include "stdbool.h"
#include <stdio.h>
#include <math.h>

//-------------------------------------------------------------------------------------------------------------Registradores
#define BW_RATE 	0x2C // Data rate and power mode control
#define POWER_CTL 	0x2D // Power-saving features control
#define INT_ENABLE	0x2E // Interrupt enable control
#define INT_MAP		0x2F // Interrupt mapping control
#define INT_SOURCE	0x30 // Source of interrupts

#define DATA_FORMAT 0x31 // Data format control
#define INT_INVERT 5
#define FULL_RESOLUTION 3


#define DATAX0		0x32 // X-Axis Data 0
#define DATAX1		0x33 // X-Axis Data 1
#define DATAY0		0x34 // Y-Axis Data 0
#define DATAY1		0x35 // Y-Axis Data 1
#define DATAZ0		0x36 // Z-Axis Data 0
#define DATAZ1		0x37 // Z-Axis Data 1
#define FIFO_CTL	0x38 // FIFO control
//Bits para verificacao de interrupcoes
#define DATA_READY	7		
#define SINGLE_TAP	6		
#define DOUBLE_TAP	5		
#define ACTIVITY	4		
#define INACTIVITY	3		
#define FREE_FALL	2		
#define WATERMARK	1		
#define OVERRUN 	0
//Defines
#define INT1 0
#define INT2 1

//--------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------Variï¿½veis da biblioteca
struct flutuante{
	double X;
	double Y;
	double Z;
};

struct inteiro{
	int16_t X;
	int16_t Y;
	int16_t Z;
};
// //--------------------------------------------------------------------------------------------------------------------------

// //--------------------------------------------------------------------------------------Protï¿½tipos das funï¿½ï¿½es da biblioteca
// void acel_register_write(uint8_t address, uint8_t data);
// uint8_t acel_register_read(uint8_t address);
// int16_t acel_register2_read(uint8_t address);
// void acel_init(SPI_HandleTypeDef* HSPI, int csn) ;
// double acel_axis_read(char eixo);
// struct inteiro acel_burst_read(void);
// struct flutuante acel_origin_angle(struct inteiro leitura);
// struct flutuante acel_offset_callibration(void);

// //Adicionados por Francisco Gomes - 2019
// void acel_measure(bool onOff);
// void acel_range(unsigned short range);
// void acel_low_power(bool onOff);
// void acel_sample_rate(unsigned int sampleRate);
// void digitalWrite(uint8_t pin, bool highLow);
// bool acel_eventHappened(uint8_t event);

class ADXL {


	public:
		bool available = false;

		int16_t X;
		int16_t Y;
		int16_t Z;

		double angX;
		double angY;
		double angZ;

		ADXL(SPI_HandleTypeDef* HSPI, int csn) ;
		void registerWrite(uint8_t address, uint8_t data);
		uint8_t registerRead(uint8_t address);
		int16_t registerRead2(uint8_t address);
		void readAxis(char axis);
		void read3axes(void);
		void read3angles(void);

		//Adicionados por Francisco Gomes - 2019
		void measure(bool onOff);
		void range(unsigned short range);
		void lowPower(bool onOff);
		void sampleRate(unsigned int sampleRate);
		bool intHappened(uint8_t event);
		void disableAllInts();
		void enableAllInts();
		void setInt(uint8_t event, uint8_t int1_or_int2, bool enable = true);
		void intActiveLow(bool onOff);
		void fullResolutionMode(bool onOff);
		void wakeupSampleRate(uint8_t sampleRate);
};



//--------------------------------------------------------------------------------------------------------------------------
