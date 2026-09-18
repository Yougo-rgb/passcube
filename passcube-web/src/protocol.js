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

function claculateChecksum(address, length, body) {
  // TODO
}

function buildFrame(body, address = ARDUINO_ADDRESS) {
  // TODO
}

export { buildFrame, claculateChecksum, frameStructure };
