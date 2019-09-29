/*Criado por Geraldo Pugialli - Kotchergenko Engenharia 2018*/

#include "ADXL345.h"

#define HIGH 1
#define LOW 0

SPI_HandleTypeDef *globalHSPIacc;
int ce_pin_acc;
int csn_pin_acc;

//------------------------------------Envio de 1 byte de dados ao registrador selecionado do ADXL345 [Endereï¿½o / Dado] (OK)
void registerWrite(unsigned char address, unsigned char data) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado[2];
	dado[0] = 0b00000000 | address;
	dado[1] = data;
	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_Transmit(globalHSPIacc, dado, 2, 50); // Envio do endereï¿½o do registrador e dados a serem gravados nele
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
}

//-----------------------------------------Leitura de 1 byte de dados do registrador selecionado do ADXL345 [Endereï¿½o] (OK)
uint8_t registerRead(unsigned char address) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b10000000 | address;
	uint8_t saida = 0;

	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, &saida, 1, 50);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
	return saida;
}

//-------------------------------------Leitura de 2 bytes de dados dos registradores selecionado do ADXL345 [Endereï¿½o] (OK)
int16_t registerRead2Bytes(unsigned char address) {
	uint8_t dado = 0b11000000 | address;
	uint8_t aux[3];
	int16_t saida = 0;

	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 3, 1);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	saida = ((aux[2] << 8) & 0xFF00) | (aux[1]);
	return saida;
}

//-------------------------------------------------------------------Configuraï¿½ï¿½o dos parï¿½metros do ADXL345 [2,4,8,16] (OK)
void accInit(unsigned short range, SPI_HandleTypeDef* HSPI, int csn) {
	globalHSPIacc = HSPI;
	csn_pin_acc = csn;

    //Alterado por Francisco Gomes - 2019
	// Data rate and power mode control
	// registerWrite(BW_RATE, 0b00001111);

	// Power-saving features control
	// registerWrite(POWER_CTL, 0b00001000);

	// Interrupt mapping control
	registerWrite(INT_MAP, 0b01111111);

	// Interrupt enable control
	registerWrite(INT_ENABLE, 0b00000000);

	// Data format control
	// switch (range) {
	// case 2: {
	// 	registerWrite(DATA_FORMAT, 0b00001000);
	// 	break;
	// }
	// case 4: {
	// 	registerWrite(DATA_FORMAT, 0b00001001);
	// 	break;
	// }
	// case 8: {
	// 	registerWrite(DATA_FORMAT, 0b00001010);
	// 	break;
	// }
	// case 16: {
	// 	registerWrite(DATA_FORMAT, 0b00001011);
	// 	break;
	// }
	// default: {
	// 	registerWrite(DATA_FORMAT, 0b00001011);
	// 	break;
	// }
	// }

	// FIFO control
	registerWrite(FIFO_CTL, 0b00000000);

	digitalWrite(csn, HIGH);
}

//----------------------------------------------Leitura da aceleraï¿½ï¿½o em um eixo selecionado ['x','y','z','X','Y','Z'] (OK)
double ADXL_axisRead(char eixo) {
	int16_t valor = 0;
	double conversao = 0.0;
	if (eixo == 'x' || eixo == 'X') {
		valor = registerRead2Bytes(DATAX0);
	}
	if (eixo == 'y' || eixo == 'Y') {
		valor = registerRead2Bytes(DATAY0);
	}
	if (eixo == 'z' || eixo == 'Z') {
		valor = registerRead2Bytes(DATAZ0);
	}
	conversao = valor * 0.00390625;				// Conversï¿½o do dado recebido
	return conversao;
}

//--------------------------------------------------------------------------Leitura de todos os eixos de uma ï¿½nica vez (OK)
struct inteiro ADXL_3axisRead(void) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b11000000 | DATAX0;
	uint8_t aux[7];
	//struct flutuante valor;
	struct inteiro leitura;
	digitalWrite(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 7, 500);// Recebimento do dado desejado
	digitalWrite(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	leitura.X = ((aux[2] << 8) & 0xFF00) | (aux[1]);// Conversï¿½o do dado recebido de X
	//valor.X = (int16_t) leitura.X * 0.00390625;
	leitura.Y = ((aux[4] << 8) & 0xFF00) | (aux[3]);// Conversï¿½o do dado recebido de Y
	//valor.Y = (int16_t) leitura.Y * 0.00390625;
	leitura.Z = ((aux[6] << 8) & 0xFF00) | (aux[5]);// Conversï¿½o do dado recebido de Z
	//valor.Z = (int16_t) leitura.Z * 0.00390625;
	HAL_SPI_DeInit(globalHSPIacc);
	return leitura;
}

//--------------------------------------------------------------Mediï¿½ï¿½o do ï¿½ngulo de deslocamento dos eixos de mediï¿½ï¿½o (OK)
struct flutuante ADXL_3anglesRead(struct inteiro leitura) {
	struct flutuante angulo;
	double resultante;

	resultante = sqrt(pow(leitura.X, 2) + pow(leitura.Y, 2) + pow(leitura.Z, 2));
	angulo.X = acos(leitura.X / resultante) * (180 / M_PI);
	angulo.Y = acos(leitura.Y / resultante) * (180 / M_PI);
	angulo.Z = acos(leitura.Z / resultante) * (180 / M_PI);
	return angulo;
}

//------------------------------------------------------------------Mediï¿½ï¿½o dos valores de offset dos eixos de mediï¿½ï¿½o (OK)
struct flutuante ADXL_offsetCalibration(void) {
	struct flutuante media;
	struct inteiro entrada;
	int amostras = 0;
	//__disable_irq(); // Desabilita interrupï¿½ï¿½es durante a inicializaï¿½ï¿½o
	media.X = 0;
	media.Y = 0;
	media.Z = 0;
	while (amostras < 6000) {
		entrada = ADXL_3axisRead(); // Leitura para inicializar a interrupï¿½ï¿½o do acelerometro
		media.X += entrada.X;
		media.Y += entrada.Y;
		media.Z += entrada.Z;
		amostras++;
	}
	media.X = media.X / 6000;
	media.Y = media.Y / 6000;
	media.Z = media.Z / 6000;
	//__enable_irq(); // 	Habilita novamente as interrupï¿½ï¿½es
	return media;
}

void acel_measure(bool onOff) {
    registerWrite(POWER_CTL, (registerRead2Bytes(POWER_CTL) & 0xF7) | onOff );
}

void acel_change_range(unsigned short range) {
    registerWrite(DATA_FORMAT, (registerRead2Bytes(DATA_FORMAT) & 0xFC) | ((uint8_t) (log2(range) - 1)) );
}

void acel_low_power(bool onOff) {
    registerWrite(BW_RATE, (onOff<<4) | (registerRead2Bytes(BW_RATE) & 0xF));
}

void acel_change_sample_rate(unsigned int sampleRate) {
    registerWrite(BW_RATE, (registerRead2Bytes(BW_RATE) & 0x10) | (log2(sampleRate/6.25) + 0b0110));
}

//UTILs
void digitalWrite(uint8_t pin, bool highLow){
    switch(pin){
        case(2):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, highLow);
            break;
        case(3):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_14, highLow);
            break;
        case(4):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_15, highLow);
            break;
        case(5):
            HAL_GPIO_WritePin(GPIOD, GPIO_PIN_0, highLow);
            break;
        case(6):
            HAL_GPIO_WritePin(GPIOD, GPIO_PIN_1, highLow);
            break;
        case(10):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, highLow);
            break;
        case(11):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, highLow);
            break;
        case(12):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_2, highLow);
            break;
        case(13):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_3, highLow);
            break;
        case(14):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, highLow);
            break;
        case(15):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, highLow);
            break;
        case(16):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, highLow);
            break;
        case(17):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_7, highLow);
            break;
        case(18):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, highLow);
            break;
        case(19):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_1, highLow);
            break;
        case(20):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_2, highLow);
            break;
        case(21):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_10, highLow);
            break;
        case(22):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_11, highLow);
            break;
        case(25):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, highLow);
            break;
        case(26):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_13, highLow);
            break;
        case(27):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_14, highLow);
            break;
        case(28):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_15, highLow);
            break;
        case(29):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_8, highLow);
            break;
        case(30):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9, highLow);
            break;
        case(31):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_10, highLow);
            break;
        case(32):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_11, highLow);
            break;
        case(33):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_12, highLow);
            break;
        case(34):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_13, highLow);
            break;
        case(37):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_14, highLow);
            break;
        case(38):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_15, highLow);
            break;
        case(39):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_3, highLow);
            break;
        case(40):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_4, highLow);
            break;
        case(41):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, highLow);
            break;
        case(42):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_6, highLow);
            break;
        case(43):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_7, highLow);
            break;
        case(45):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_8, highLow);
            break;
        case(46):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_9, highLow);
            break;
        default:
            break;

    }
}
