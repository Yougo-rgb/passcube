const STX = 0x02;
const ETX = 0x03;
const ARDUINO_ADDRESS = 0x01;
const XOR_KEY = 0x67;

const SET_KEY = 0x01;
const VERIFY_CUBE = 0x02;
const GET_STATUS = 0x03;

const ACK = 0x06;
const NAK = 0x15;

const ACCESS_GRANTED = 0x10;
const ACCESS_DENIED = 0x11;

/**
 * Describes the structure of a communication frame.
 *
 * A frame contains a start byte, destination address, body length,
 * body data, checksum, and end byte.
 */
const frameStructure = {
  stx: {
    name: "STX",
    sizeInBytes: 1,
    value: 0x02,
    description: "Start of frame",
  },

  address: {
    name: "Address",
    sizeInBytes: 1,
    description: "Destination device address",
  },

  length: {
    name: "Length",
    sizeInBytes: 1,
    description: "Number of bytes present in the Body field",
  },

  body: {
    name: "Body",
    sizeInBytes: null,
    value: null,
    description: "Command and associated data",
  },

  checksum: {
    name: "Checksum",
    sizeInBytes: 1,
    type: "XOR",
    value: null,
    description: "XOR of the address, length, and all bytes in the body",
  },

  etx: {
    name: "ETX",
    sizeInBytes: 1,
    value: 0x03,
    description: "End of frame",
  },
};

/**
 * Calculates the XOR checksum of a frame.
 *
 * The checksum is calculated using the address, length, and every byte contained in the body.
 *
 * @param {number} address - The destination device address.
 * @param {number} length - The number of bytes in the body.
 * @param {Uint8Array} body - The body bytes.
 * @returns {number} The calculated checksum.
 */
function calculateChecksum(address, length, body) {
  let checksum = address ^ length;

  for (const byte of body) {
    checksum ^= byte;
  }

  return checksum;
}

/**
 * Builds a communication frame according to the defined protocol.
 *
 * @param {number} address - The destination device address.
 * @param {Uint8Array} body - The command and associated data.
 * @returns {Uint8Array} The complete communication frame.
 */
function buildFrame(address = ARDUINO_ADDRESS, body) {
  const length = body.length;
  const checksum = calculateChecksum(address, length, body);

  return new Uint8Array([STX, address, length, ...body, checksum, ETX]);
}

export {
  buildFrame,
  calculateChecksum,
  frameStructure,
  STX,
  ETX,
  ARDUINO_ADDRESS,
  XOR_KEY,
  SET_KEY,
  VERIFY_CUBE,
  GET_STATUS,
  ACK,
  NAK,
  ACCESS_GRANTED,
  ACCESS_DENIED,
};
