const baudRate = 9600;

let serialPort = null;
let writer = null;

/**
 * Creates a connection with an Arduino board using the Web Serial API.
 *
 * @returns {Promise<void>}
 * @throws {Error} If the Web Serial API is not supported.
 */
async function arduinoConnection() {
  if (!("serial" in navigator)) {
    throw new Error("Eb Serial API is not supported by this browser.");
  }

  serialPort = await navigator.serial.requestPort();

  await serialPort.open({
    baudRate: baudRate,
  });

  writer = serialPort.writable.getWriter();

  console.log("Arduini connected.");
}

/**
 * Disconnects from the Arduino board.
 *
 * @returns {Promise<void>}
 */
async function arduinoDeconnection() {
  if (writer) {
    writer.releaseLock();
    writer = null;
  }

  if (serialPort) {
    await serialPort.close();
    serialPort = null;
  }

  console.log("Arduino disconnected");
}

/**
 * Sends a communication frame to the Arduino.
 *
 * @param {Uint8Array} frame - The communication frame to send.
 * @returns {Promise<void>}
 * @throws {Error} If the Arduino is not connected.
 */
async function sendToArduino(frame) {
  if (!writer) {
    throw new Error("Arduino is not connected");
  }

  await writer.write(frame);

  console.log("Frame sent tp Arduino:", frame);
}

export { arduinoConnection, arduinoDeconnection, sendToArduino };
