import { sendToArduino } from "./arduino";
import {
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
} from "./protocol";

/**
 * Converts a facelet string into an array of bytes.
 *
 * Each facelet color is represented by a unique byte value:
 * U = 0x00, R = 0x01, F = 0x02, D = 0x03, L = 0x04, B = 0x05.
 *
 * @param {string} facelets - The facelet string to convert.
 * @returns {Uint8Array} The facelet data represented as bytes.
 */
function faceletsToBytes(facelets) {
  const mapping = {
    U: 0x00,
    R: 0x01,
    F: 0x02,
    D: 0x03,
    L: 0x04,
    B: 0x05,
  };

  const bytes = new Uint8Array(facelets.length);

  for (let i = 0; i < facelets.length; i++) {
    bytes[i] = mapping[facelets[i]];
  }

  return bytes;
}

/**
 * Applies XOR masking to the given data.
 *
 * @param {Uint8Array} data - The data to mask.
 * @returns {Uint8Array} The masked data.
 */
function xorEncryption(data) {
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ XOR_KEY;
  }

  return result;
}

/**
 * Sets the current cube configuration as the new password.
 *
 * Converts the facelet data into bytes, applies XOR masking, adds the SET_KEY command, and sends the resulting data to the Arduino.
 *
 * @param {string} facelets - The current cube configuration as a facelet string.
 * @returns {Promise<void>}
 */
async function setNewPassword(facelets) {
  const faceletBytes = faceletsToBytes(facelets);

  const encryptedFaceletBytes = xorEncryption(faceletBytes);

  const body = new Uint8Array([SET_KEY, ...encryptedFaceletBytes]);

  await sendToArduino(body);
}

/**
 * Checks whether the current cube configuration matches the stored password.
 *
 * Converts the facelet data into bytes, applies XOR masking, adds the VERIFY_CUBE command, and sends the resulting data to the Arduino.
 *
 * @param {string} facelets - The current cube configuration as a facelet string.
 * @returns {Promise<void>}
 */
async function checkPassword(facelets) {
  const faceletBytes = faceletsToBytes(facelets);

  const encryptedFaceletBytes = xorEncryption(faceletBytes);

  const body = new Uint8Array([VERIFY_CUBE, ...encryptedFaceletBytes]);

  await sendToArduino(body);
}

export { checkPassword, setNewPassword, xorEncryption };
