/*Criado por Geraldo Pugialli - Kotchergenko Engenharia 2018*/

#include "ADXL345.h"
#include "nRF24.h"

#define HIGH 1
#define LOW 0

SPI_HandleTypeDef *globalHSPIacc;
int ce_pin_acc;
int csn_pin_acc;

//------------------------------------Envio de 1 byte de dados ao registrador selecionado do ADXL345 [Endere�o / Dado] (OK)
void acel_register_write(unsigned char address, unsigned char data) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado[2];
	dado[0] = 0b00000000 | address;
	dado[1] = data;
	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do aceler�metro para "low"
	HAL_SPI_Transmit(globalHSPIacc, dado, 2, 50); // Envio do endere�o do registrador e dados a serem gravados nele
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do aceler�metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
}

//-----------------------------------------Leitura de 1 byte de dados do registrador selecionado do ADXL345 [Endere�o] (OK)
uint8_t acel_register_read(unsigned char address) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b10000000 | address;
	uint8_t saida = 0;

	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do aceler�metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, &saida, 1, 50);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do aceler�metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
	return saida;
}

//-------------------------------------Leitura de 2 bytes de dados dos registradores selecionado do ADXL345 [Endere�o] (OK)
int16_t acel_register2_read(unsigned char address) {
	uint8_t dado = 0b11000000 | address;
	uint8_t aux[3];
	int16_t saida = 0;

	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do aceler�metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 3, 1);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do aceler�metro para "high"
	saida = ((aux[2] << 8) & 0xFF00) | (aux[1]);
	return saida;
}

//-------------------------------------------------------------------Configura��o dos par�metros do ADXL345 [2,4,8,16] (OK)
void acel_init(unsigned short range, SPI_HandleTypeDef* HSPI, int csn) {
	globalHSPIacc = HSPI;
	csn_pin_acc = csn;

	// Data rate and power mode control
	acel_register_write(BW_RATE, 0b00001111);

	// Power-saving features control
	acel_register_write(POWER_CTL, 0b00001000);

	// Interrupt mapping control
	acel_register_write(INT_MAP, 0b01111111);

	// Interrupt enable control
	acel_register_write(INT_ENABLE, 0b00000000);

	// Data format control
	switch (range) {
	case 2: {
		acel_register_write(DATA_FORMAT, 0b00001000);
		break;
	}
	case 4: {
		acel_register_write(DATA_FORMAT, 0b00001001);
		break;
	}
	case 8: {
		acel_register_write(DATA_FORMAT, 0b00001010);
		break;
	}
	case 16: {
		acel_register_write(DATA_FORMAT, 0b00001011);
		break;
	}
	default: {
		acel_register_write(DATA_FORMAT, 0b00001011);
		break;
	}
	}

	// FIFO control
	acel_register_write(FIFO_CTL, 0b00000000);

	digitalWrite(csn, HIGH);
}

//----------------------------------------------Leitura da acelera��o em um eixo selecionado ['x','y','z','X','Y','Z'] (OK)
double acel_axis_read(char eixo) {
	int16_t valor = 0;
	double conversao = 0.0;
	if (eixo == 'x' || eixo == 'X') {
		valor = acel_register2_read(DATAX0);
	}
	if (eixo == 'y' || eixo == 'Y') {
		valor = acel_register2_read(DATAY0);
	}
	if (eixo == 'z' || eixo == 'Z') {
		valor = acel_register2_read(DATAZ0);
	}
	conversao = valor * 0.00390625;				// Convers�o do dado recebido
	return conversao;
}

//--------------------------------------------------------------------------Leitura de todos os eixos de uma �nica vez (OK)
struct inteiro acel_burst_read(void) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b11000000 | DATAX0;
	uint8_t aux[7];
	//struct flutuante valor;
	struct inteiro leitura;
	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do aceler�metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 7, 500);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do aceler�metro para "high"
	leitura.X = ((aux[2] << 8) & 0xFF00) | (aux[1]);// Convers�o do dado recebido de X
	//valor.X = (int16_t) leitura.X * 0.00390625;
	leitura.Y = ((aux[4] << 8) & 0xFF00) | (aux[3]);// Convers�o do dado recebido de Y
	//valor.Y = (int16_t) leitura.Y * 0.00390625;
	leitura.Z = ((aux[6] << 8) & 0xFF00) | (aux[5]);// Convers�o do dado recebido de Z
	//valor.Z = (int16_t) leitura.Z * 0.00390625;
	HAL_SPI_DeInit(globalHSPIacc);
	return leitura;
}

//--------------------------------------------------------------Medi��o do �ngulo de deslocamento dos eixos de medi��o (OK)
struct flutuante acel_origin_angle(struct flutuante leitura) {
	struct flutuante angulo;
	double resultante;

	resultante = sqrt(pow(leitura.X, 2) + pow(leitura.Y, 2) + pow(leitura.Z, 2));
	angulo.X = acos(leitura.X / resultante) * (180 / M_PI);
	angulo.Y = acos(leitura.Y / resultante) * (180 / M_PI);
	angulo.Z = acos(leitura.Z / resultante) * (180 / M_PI);
	return angulo;
}

//------------------------------------------------------------------Medi��o dos valores de offset dos eixos de medi��o (OK)
struct flutuante acel_offset_callibration(void) {
	struct flutuante media;
	struct inteiro entrada;
	int amostras = 0;
	//__disable_irq(); // Desabilita interrup��es durante a inicializa��o
	media.X = 0;
	media.Y = 0;
	media.Z = 0;
	while (amostras < 6000) {
		entrada = acel_burst_read(); // Leitura para inicializar a interrup��o do acelerometro
		media.X += entrada.X;
		media.Y += entrada.Y;
		media.Z += entrada.Z;
		amostras++;
	}
	media.X = media.X / 6000;
	media.Y = media.Y / 6000;
	media.Z = media.Z / 6000;
	//__enable_irq(); // 	Habilita novamente as interrup��es
	return media;
}
