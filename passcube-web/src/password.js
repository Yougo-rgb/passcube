import { sendToArduino } from "./arduino";

import {
  buildFrame,
  ARDUINO_ADDRESS,
  XOR_KEY,
  SET_KEY,
  VERIFY_CUBE,
} from "./protocol";

/**
 * Converts a facelet string into an array of bytes.
 *
 * U = 0x00
 * R = 0x01
 * F = 0x02
 * D = 0x03
 * L = 0x04
 * B = 0x05
 *
 * @param {string} facelets
 * @returns {Uint8Array}
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

  const bytes =
    new Uint8Array(
      facelets.length,
    );

  for (
    let i = 0;
    i < facelets.length;
    i++
  ) {
    bytes[i] =
      mapping[facelets[i]];
  }

  return bytes;
}

/**
 * Applies XOR masking to the given data.
 *
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function xorEncryption(data) {
  const result =
    new Uint8Array(
      data.length,
    );

  for (
    let i = 0;
    i < data.length;
    i++
  ) {
    result[i] =
      data[i] ^ XOR_KEY;
  }

  return result;
}

/**
 * Sets the current cube configuration
 * as the new password.
 *
 * @param {string} facelets
 * @returns {Promise<string>}
 */
async function setNewPassword(
  facelets,
) {
  const faceletBytes =
    faceletsToBytes(
      facelets,
    );

  const encryptedFaceletBytes =
    xorEncryption(
      faceletBytes,
    );

  const body =
    new Uint8Array([
      SET_KEY,
      ...encryptedFaceletBytes,
    ]);

  const frame =
    buildFrame(
      ARDUINO_ADDRESS,
      body,
    );

  console.log(
    "[Password] Setting new password:",
    frame,
  );

  return await sendToArduino(
    frame,
  );
}

/**
 * Checks whether the current cube
 * configuration matches the stored password.
 *
 * @param {string} facelets
 * @returns {Promise<string>}
 */
async function checkPassword(
  facelets,
) {
  const faceletBytes =
    faceletsToBytes(
      facelets,
    );

  const encryptedFaceletBytes =
    xorEncryption(
      faceletBytes,
    );

  const body =
    new Uint8Array([
      VERIFY_CUBE,
      ...encryptedFaceletBytes,
    ]);

  const frame =
    buildFrame(
      ARDUINO_ADDRESS,
      body,
    );

  console.log(
    "[Password] Checking password:",
    frame,
  );

  return await sendToArduino(
    frame,
  );
}

export {
  checkPassword,
  setNewPassword,
  xorEncryption,
};
