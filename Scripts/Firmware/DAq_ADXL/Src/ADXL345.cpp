/*Criado por Geraldo Pugialli - Kotchergenko Engenharia 2018*/
//Alterado por Francisco Gomes - 2019

#include "ADXL345.h"
using namespace std;
#define HIGH 1
#define LOW 0

SPI_HandleTypeDef *globalHSPIacc;
int ce_pin_acc;
int csn_pin_acc;

//UTILs
void writePin(uint8_t pin, int highLow){
    switch(pin){
        case(2):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, (GPIO_PinState)(highLow));
            break;
        case(3):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_14, (GPIO_PinState)(highLow));
            break;
        case(4):
            HAL_GPIO_WritePin(GPIOC, GPIO_PIN_15, (GPIO_PinState)(highLow));
            break;
        case(5):
            HAL_GPIO_WritePin(GPIOD, GPIO_PIN_0, (GPIO_PinState)(highLow));
            break;
        case(6):
            HAL_GPIO_WritePin(GPIOD, GPIO_PIN_1, (GPIO_PinState)(highLow));
            break;
        case(10):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_0, (GPIO_PinState)(highLow));
            break;
        case(11):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, (GPIO_PinState)(highLow));
            break;
        case(12):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_2, (GPIO_PinState)(highLow));
            break;
        case(13):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_3, (GPIO_PinState)(highLow));
            break;
        case(14):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4, (GPIO_PinState)(highLow));
            break;
        case(15):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, (GPIO_PinState)(highLow));
            break;
        case(16):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, (GPIO_PinState)(highLow));
            break;
        case(17):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_7, (GPIO_PinState)(highLow));
            break;
        case(18):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, (GPIO_PinState)(highLow));
            break;
        case(19):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_1, (GPIO_PinState)(highLow));
            break;
        case(20):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_2, (GPIO_PinState)(highLow));
            break;
        case(21):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_10, (GPIO_PinState)(highLow));
            break;
        case(22):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_11, (GPIO_PinState)(highLow));
            break;
        case(25):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, (GPIO_PinState)(highLow));
            break;
        case(26):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_13, (GPIO_PinState)(highLow));
            break;
        case(27):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_14, (GPIO_PinState)(highLow));
            break;
        case(28):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_15, (GPIO_PinState)(highLow));
            break;
        case(29):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_8, (GPIO_PinState)(highLow));
            break;
        case(30):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9, (GPIO_PinState)(highLow));
            break;
        case(31):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_10, (GPIO_PinState)(highLow));
            break;
        case(32):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_11, (GPIO_PinState)(highLow));
            break;
        case(33):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_12, (GPIO_PinState)(highLow));
            break;
        case(34):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_13, (GPIO_PinState)(highLow));
            break;
        case(37):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_14, (GPIO_PinState)(highLow));
            break;
        case(38):
            HAL_GPIO_WritePin(GPIOA, GPIO_PIN_15, (GPIO_PinState)(highLow));
            break;
        case(39):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_3, (GPIO_PinState)(highLow));
            break;
        case(40):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_4, (GPIO_PinState)(highLow));
            break;
        case(41):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, (GPIO_PinState)(highLow));
            break;
        case(42):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_6, (GPIO_PinState)(highLow));
            break;
        case(43):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_7, (GPIO_PinState)(highLow));
            break;
        case(45):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_8, (GPIO_PinState)(highLow));
            break;
        case(46):
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_9, (GPIO_PinState)(highLow));
            break;
        default:
            break;

    }
}

_line::_line(uint8_t _capacity){
    capacity = _capacity;
	data = (int16_t*) malloc (capacity * sizeof(int16_t));
	first = 0;
	last = -1;
	available = 0;
}

void _line::insertValue(int16_t value) {

    if (last == capacity-1){
        last = -1;
    }
    last++;
    data[last] = value; // incrementa last e insere
    available++; // mais um item inserido
}

int16_t _line::getValue() { // pega o item do comeÃ§o da line

	int16_t temp = data[first++]; // pega o valor e incrementa o first

	if(first == capacity)
		first = 0;

	available--;  // um item retirado
	return temp;

}

//------------------------------------Envio de 1 byte de dados ao registrador selecionado do ADXL345 [Endereï¿½o / Dado] (OK)
void ADXL::registerWrite(unsigned char address, unsigned char data) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado[2];
	dado[0] = 0b00000000 | address;
	dado[1] = data;
	writePin(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_Transmit(globalHSPIacc, dado, 2, 50); // Envio do endereï¿½o do registrador e dados a serem gravados nele
	writePin(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
}

//-----------------------------------------Leitura de 1 byte de dados do registrador selecionado do ADXL345 [Endereï¿½o] (OK)
uint8_t ADXL::registerRead(unsigned char address) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b10000000 | address;
	uint8_t saida = 0;

	writePin(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, &saida, 1, 50);// Recebimento do dado desejado
	writePin(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	HAL_SPI_DeInit(globalHSPIacc);
	return saida;
}

//-------------------------------------Leitura de 2 bytes de dados dos registradores selecionado do ADXL345 [Endereï¿½o] (OK)
int16_t ADXL::registerRead2(unsigned char address) {
	uint8_t dado = 0b11000000 | address;
	uint8_t aux[3];
	int16_t saida = 0;

	writePin(csn_pin_acc, LOW); // Switch to Chip Select do acelerï¿½metro para "low"
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 3, 1);// Recebimento do dado desejado
	writePin(csn_pin_acc, HIGH);// Switch to Chip Select do acelerï¿½metro para "high"
	saida = ((aux[2] << 8) & 0xFF00) | (aux[1]);
	return saida;
}

//-------------------------------------------------------------------Configuraï¿½ï¿½o dos parï¿½metros do ADXL345 [2,4,8,16] (OK)
ADXL::ADXL(SPI_HandleTypeDef* HSPI, int csn) {
    globalHSPIacc = HSPI;
	csn_pin_acc = csn;
}

//----------------------------------------------Leitura da aceleraï¿½ï¿½o em um eixo selecionado ['x','y','z','X','Y','Z'] (OK)
void ADXL::readAxis(char axis) {

	if (axis == 'x' || axis == 'X') {
		X.insertValue(registerRead2(DATAX0));
	}
	if (axis == 'y' || axis == 'Y') {
		Y.insertValue(registerRead2(DATAY0));
	}
	if (axis == 'z' || axis == 'Z') {
		Z.insertValue(registerRead2(DATAZ0));
	}

}

//--------------------------------------------------------------------------Leitura de todos os eixos de uma ï¿½nica vez (OK)
void ADXL::read3axes(void) {
	HAL_SPI_Init(globalHSPIacc);
	uint8_t dado = 0b11000000 | DATAX0;
	uint8_t aux[7];

	writePin(csn_pin_acc, LOW); 
	HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 7, 500);
	writePin(csn_pin_acc, HIGH);

	X.insertValue(((aux[2] << 8) & 0xFF00) | (aux[1]));
	Y.insertValue(((aux[4] << 8) & 0xFF00) | (aux[3]));
	Z.insertValue(((aux[6] << 8) & 0xFF00) | (aux[5]));

	HAL_SPI_DeInit(globalHSPIacc);
}

//--------------------------------------------------------------Mediï¿½ï¿½o do ï¿½ngulo de deslocamento dos eixos de mediï¿½ï¿½o (OK)
void ADXL::read3angles() {
	double resultante;
    int16_t x, y, z;

    x = X.getValue();
    y = Y.getValue();
    z = Z.getValue();

	resultante = sqrt(pow(x, 2) + pow(y, 2) + pow(z, 2));
	angX = acos(x / resultante) * (180 / M_PI);
	angY = acos(y / resultante) * (180 / M_PI);
	angZ = acos(z / resultante) * (180 / M_PI);
}

void ADXL::measure(bool onOff) {
    registerWrite(POWER_CTL, (registerRead(POWER_CTL) & 0xF7) | (onOff<<3) );
}

void ADXL::range(unsigned short range) {
    registerWrite(DATA_FORMAT, (registerRead(DATA_FORMAT) & 0xFC) | ((uint8_t) (log2(range) - 1)) );
}

void ADXL::lowPower(bool onOff) {
    registerWrite(BW_RATE, (onOff<<4) | (registerRead(BW_RATE) & 0xF));
}

void ADXL::sampleRate(unsigned int sampleRate) {
    registerWrite(BW_RATE, (registerRead(BW_RATE) & 0x10) | (uint8_t)(log2(sampleRate/6.25) + 0b0110));
}

bool ADXL::intHappened(uint8_t event) {
    return ((registerRead(INT_SOURCE) & (1 << event))?true:false);
}

void ADXL::disableAllInts(){
    registerWrite(INT_ENABLE, 0);
}

void ADXL::enableAllInts(){
    registerWrite(INT_ENABLE, 0xFF);
}

void ADXL::setInt(uint8_t event, uint8_t int1_or_int2, bool enable = true) {
    uint8_t intsEnableds = registerRead(INT_ENABLE);

    disableAllInts();
    
    if(int1_or_int2 == INT1)
        registerWrite(INT_MAP, registerRead(INT_MAP) & (~(1 << event)));
    else
        registerWrite(INT_MAP, registerRead(INT_MAP) | (1 << event));

    if (enable)
        intsEnableds = intsEnableds | (1 << event);
    else
        intsEnableds = intsEnableds & (~(1 << event));

    registerWrite(INT_ENABLE, intsEnableds);
}

void ADXL::intActiveLow(bool onOff) {

    if(onOff)
        registerWrite(DATA_FORMAT, registerRead(DATA_FORMAT) | (1 << INT_INVERT));
    else
        registerWrite(DATA_FORMAT, registerRead(DATA_FORMAT) & (~(1 << INT_INVERT)));
    
}

void ADXL::fullResolutionMode(bool onOff) {

    if(onOff)
        registerWrite(DATA_FORMAT, registerRead(DATA_FORMAT) | (1 << FULL_RESOLUTION));
    else
        registerWrite(DATA_FORMAT, registerRead(DATA_FORMAT) & (~(1 << FULL_RESOLUTION)));

}

void ADXL::wakeupSampleRate(uint8_t sampleRate) {

    switch (sampleRate)
    {
    case 8:
        registerWrite(POWER_CTL, registerRead(POWER_CTL) & 0xFC);
        break;
    case 4:
        registerWrite(POWER_CTL, registerRead(POWER_CTL) & 0xFD);
        break;
    case 2:
        registerWrite(POWER_CTL, registerRead(POWER_CTL) & 0xFE);
        break;
    default:
        registerWrite(POWER_CTL, registerRead(POWER_CTL) & 0xFF);
        break;
    }

}

void ADXL::fifoConfig(uint8_t fifoMode, uint8_t fifoQuantityToGenerateInterrupt = 16, uint8_t int1_or_int2 = INT2) {

    if(fifoQuantityToGenerateInterrupt > 32) {
        fifoQuantityToGenerateInterrupt = 32;
    }

    registerWrite(FIFO_CTL, (fifoMode << 6) | int1_or_int2 << 5 | fifoQuantityToGenerateInterrupt);

}

void ADXL::fifoRead(){
    uint8_t fifoAvailableSize = (registerRead(FIFO_STATUS) & 0x3F);
    uint8_t usCounter = 0;
    uint8_t dado = 0b11000000 | DATAX0;
    uint8_t aux[7];
    uint8_t saida[33];

    HAL_SPI_Init(globalHSPIacc);
    writePin(csn_pin_acc, LOW);

    for(uint8_t i = 0; i < fifoAvailableSize; i += 7) {
        HAL_SPI_TransmitReceive(globalHSPIacc, &dado, aux, 7, 500);
        usCounter = SysTick->VAL;
        X.insertValue(((aux[2] << 8) & 0xFF00) | (aux[1]));
        Y.insertValue(((aux[4] << 8) & 0xFF00) | (aux[3]));
        Z.insertValue(((aux[6] << 8) & 0xFF00) | (aux[5]));
        while((SysTick->VAL - usCounter) < 360); //Count 360 cycles of 72MHz = 5us
    }
    
    writePin(csn_pin_acc, HIGH);
    HAL_SPI_DeInit(globalHSPIacc);
}
