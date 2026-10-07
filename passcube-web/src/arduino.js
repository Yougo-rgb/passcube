const SERVICE_UUID =
  "0000ffe0-0000-1000-8000-00805f9b34fb";

const CHARACTERISTIC_UUID =
  "0000ffe1-0000-1000-8000-00805f9b34fb";

const STX = 0x02;
const ETX = 0x03;

const ACK = 0x06;
const NAK = 0x15;

const ACCESS_GRANTED = 0x10;
const ACCESS_DENIED = 0x11;

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

/**
 * Creates a Bluetooth connection with the HM-10 module.
 *
 * @returns {Promise<void>}
 */
async function arduinoConnection() {
  if (!("bluetooth" in navigator)) {
    throw new Error(
      "Web Bluetooth API is not supported by this browser.",
    );
  }

  console.log(
    "[Bluetooth] Recherche du HM-10...",
  );

  bluetoothDevice =
    await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID],
    });

  console.log(
    "[Bluetooth] Périphérique sélectionné:",
    bluetoothDevice.name,
  );

  bluetoothDevice.addEventListener(
    "gattserverdisconnected",
    handleBluetoothDisconnected,
  );

  console.log(
    "[Bluetooth] Connexion GATT...",
  );

  const server =
    await bluetoothDevice.gatt.connect();

  console.log(
    "[Bluetooth] Bluetooth connecté.",
  );

  const service =
    await server.getPrimaryService(
      SERVICE_UUID,
    );

  console.log(
    "[Bluetooth] Service HM-10 récupéré.",
  );

  bluetoothCharacteristic =
    await service.getCharacteristic(
      CHARACTERISTIC_UUID,
    );

  console.log(
    "[Bluetooth] Caractéristique HM-10 récupérée.",
  );

  await bluetoothCharacteristic.startNotifications();

  console.log(
    "[Bluetooth] Notifications activées.",
  );

  console.log(
    "[Bluetooth] HM-10 connecté et prêt.",
  );
}

/**
 * Converts an Arduino response byte
 * into a readable response string.
 *
 * @param {number} response
 * @returns {string|null}
 */
function parseArduinoResponse(response) {
  switch (response) {
    case ACK:
      return "ACK";

    case NAK:
      return "NAK";

    case ACCESS_GRANTED:
      return "ACCESS_GRANTED";

    case ACCESS_DENIED:
      return "ACCESS_DENIED";

    default:
      return null;
  }
}

/**
 * Sends a complete PassCube protocol frame
 * and waits for the Arduino response.
 *
 * @param {Uint8Array} frame
 * @returns {Promise<string>}
 */
function sendToArduino(frame) {
  return new Promise(
    async (resolve, reject) => {
      if (!isArduinoConnected()) {
        reject(
          new Error(
            "Arduino/HM-10 is not connected.",
          ),
        );
        return;
      }

      if (!(frame instanceof Uint8Array)) {
        reject(
          new TypeError(
            "Frame must be a Uint8Array.",
          ),
        );
        return;
      }

      console.log(
        "[Arduino TX] Frame envoyée:",
        frame,
      );

      console.log(
        "[Arduino TX] HEX:",
        Array.from(frame)
          .map((byte) =>
            byte
              .toString(16)
              .padStart(2, "0")
              .toUpperCase(),
          )
          .join(" "),
      );

      console.log(
        "[Arduino TX] Length:",
        frame.length,
        "bytes",
      );

      /**
       * Handles the response received
       * from the Arduino.
       */
      function responseListener(event) {
        const value =
          event.target.value;

        if (!value) {
          return;
        }

        const bytes =
          new Uint8Array(
            value.buffer,
            value.byteOffset,
            value.byteLength,
          );

        console.log(
          "[Arduino RX] Frame reçue:",
          bytes,
        );

        console.log(
          "[Arduino RX] HEX:",
          Array.from(bytes)
            .map((byte) =>
              byte
                .toString(16)
                .padStart(2, "0")
                .toUpperCase(),
            )
            .join(" "),
        );

        // Expected:
        // STX | ADDRESS | LENGTH | RESPONSE | CHECKSUM | ETX
        if (
          bytes.length !== 6 ||
          bytes[0] !== STX ||
          bytes[5] !== ETX
        ) {
          console.log(
            "[Arduino RX] Trame invalide.",
          );

          return;
        }

        const response =
          parseArduinoResponse(
            bytes[3],
          );

        if (response === null) {
          console.log(
            "[Arduino RX] Réponse inconnue:",
            bytes[3],
          );

          return;
        }

        console.log(
          "[Arduino RX]",
          response,
        );

        bluetoothCharacteristic.removeEventListener(
          "characteristicvaluechanged",
          responseListener,
        );

        resolve(response);
      }

      bluetoothCharacteristic.addEventListener(
        "characteristicvaluechanged",
        responseListener,
      );

      try {
        await bluetoothCharacteristic.writeValue(
          frame,
        );

        console.log(
          "[Arduino TX] Envoi terminé.",
        );
      } catch (error) {
        bluetoothCharacteristic.removeEventListener(
          "characteristicvaluechanged",
          responseListener,
        );

        reject(error);
      }
    },
  );
}

/**
 * Handles an unexpected Bluetooth disconnection.
 *
 * @returns {void}
 */
function handleBluetoothDisconnected() {
  console.log(
    "[Bluetooth] HM-10 déconnecté.",
  );

  bluetoothCharacteristic = null;
}

/**
 * Checks whether the HM-10 is connected.
 *
 * @returns {boolean}
 */
function isArduinoConnected() {
  return (
    bluetoothDevice !== null &&
    bluetoothDevice.gatt !== null &&
    bluetoothDevice.gatt.connected &&
    bluetoothCharacteristic !== null
  );
}

/**
 * Disconnects from the HM-10.
 *
 * @returns {Promise<void>}
 */
async function arduinoDeconnection() {
  try {
    if (
      bluetoothDevice &&
      bluetoothDevice.gatt &&
      bluetoothDevice.gatt.connected
    ) {
      console.log(
        "[Bluetooth] Déconnexion du HM-10...",
      );

      bluetoothDevice.gatt.disconnect();
    }
  } catch (error) {
    console.error(
      "[Bluetooth] Erreur lors de la déconnexion:",
      error,
    );
  }

  bluetoothCharacteristic = null;
  bluetoothDevice = null;

  console.log(
    "[Bluetooth] Arduino déconnecté.",
  );
}

export {
  arduinoConnection,
  arduinoDeconnection,
  sendToArduino,
  isArduinoConnected,
};
