#include <SoftwareSerial.h>

SoftwareSerial HM10(2, 3);

// Protocol
const uint8_t STX = 0x02;
const uint8_t ETX = 0x03;
const uint8_t ARDUINO_ADDRESS = 0x01;
const uint8_t XOR_KEY = 0x67;

const uint8_t SET_KEY = 0x01;
const uint8_t VERIFY_CUBE = 0x02;
const uint8_t GET_STATUS = 0x03;

const uint8_t ACK = 0x06;
const uint8_t NAK = 0x15;

const uint8_t ACCESS_GRANTED = 0x10;
const uint8_t ACCESS_DENIED = 0x11;

const uint8_t KEY_SIZE = 54;

uint8_t storedKey[KEY_SIZE];
bool hasKey = false;

// Frame buffer
uint8_t address;
uint8_t length;
uint8_t body[64];
uint8_t bodyIndex;
uint8_t checksum;

enum State
{
  WAIT_STX,
  READ_ADDRESS,
  READ_LENGTH,
  READ_BODY,
  READ_CHECKSUM,
  READ_ETX
};

State state = WAIT_STX;


// ============================================================
// Setup
// ============================================================

void setup()
{
  Serial.begin(9600);
  HM10.begin(9600);
}


// ============================================================
// Loop
// ============================================================

void loop()
{
  while (HM10.available())
  {
    readByte(HM10.read());
  }
}


// ============================================================
// Frame parser
// ============================================================

void readByte(uint8_t byte)
{
  switch (state)
  {
    case WAIT_STX:
      if (byte == STX)
        state = READ_ADDRESS;
      break;

    case READ_ADDRESS:
      address = byte;
      state = READ_LENGTH;
      break;

    case READ_LENGTH:
      length = byte;
      bodyIndex = 0;

      if (length > sizeof(body))
      {
        sendResponse(NAK);
        resetParser();
      }
      else if (length == 0)
      {
        state = READ_CHECKSUM;
      }
      else
      {
        state = READ_BODY;
      }
      break;

    case READ_BODY:
      body[bodyIndex++] = byte;

      if (bodyIndex >= length)
        state = READ_CHECKSUM;

      break;

    case READ_CHECKSUM:
      checksum = byte;
      state = READ_ETX;
      break;

    case READ_ETX:
      if (byte == ETX)
        processFrame();
      else
        sendResponse(NAK);

      resetParser();
      break;
  }
}


// ============================================================
// Process frame
// ============================================================

void processFrame()
{
  if (address != ARDUINO_ADDRESS)
  {
    sendResponse(NAK);
    return;
  }

  uint8_t calculated = address ^ length;

  for (uint8_t i = 0; i < length; i++)
    calculated ^= body[i];

  if (calculated != checksum)
  {
    sendResponse(NAK);
    return;
  }

  if (length < 1)
  {
    sendResponse(NAK);
    return;
  }

  switch (body[0])
  {
    case SET_KEY:
      setKey();
      break;

    case VERIFY_CUBE:
      verifyCube();
      break;

    case GET_STATUS:
      getStatus();
      break;

    default:
      sendResponse(NAK);
      break;
  }
}


// ============================================================
// SET_KEY
// ============================================================

void setKey()
{
  if (length != 55)
  {
    sendResponse(NAK);
    return;
  }

  for (uint8_t i = 0; i < KEY_SIZE; i++)
    storedKey[i] = body[i + 1] ^ XOR_KEY;

  hasKey = true;

  sendResponse(ACK);
}


// ============================================================
// VERIFY_CUBE
// ============================================================

void verifyCube()
{
  if (length != 55 || !hasKey)
  {
    sendResponse(NAK);
    return;
  }

  for (uint8_t i = 0; i < KEY_SIZE; i++)
  {
    uint8_t received = body[i + 1] ^ XOR_KEY;

    if (received != storedKey[i])
    {
      sendResponse(ACCESS_DENIED);
      return;
    }
  }

  sendResponse(ACCESS_GRANTED);
}


// ============================================================
// GET_STATUS
// ============================================================

void getStatus()
{
  sendResponse(hasKey ? ACK : NAK);
}


// ============================================================
// Send response frame
// ============================================================

void sendResponse(uint8_t response)
{
  uint8_t responseLength = 1;
  uint8_t checksum =
    ARDUINO_ADDRESS ^ responseLength ^ response;

  HM10.write(STX);
  HM10.write(ARDUINO_ADDRESS);
  HM10.write(responseLength);
  HM10.write(response);
  HM10.write(checksum);
  HM10.write(ETX);
}


// ============================================================
// Reset parser
// ============================================================

void resetParser()
{
  state = WAIT_STX;
  address = 0;
  length = 0;
  bodyIndex = 0;
  checksum = 0;
}
