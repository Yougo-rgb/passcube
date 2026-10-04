const SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

/**
 * Creates a Bluetooth connection with the HM-10 module.
 *
 * The Arduino Uno is connected to the HM-10 through UART.
 * The browser communicates directly with the HM-10 using the Web Bluetooth API.
 *
 * @returns {Promise<void>}
 * @throws {Error} If Web Bluetooth is not supported or the connection fails.
 */
async function arduinoConnection() {
  if (!("bluetooth" in navigator)) {
    throw new Error("Web Bluetooth API is not supported by this browser.");
  }

  console.log("[Bluetooth] Recherche du HM-10...");

  bluetoothDevice = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [SERVICE_UUID],
  });

  console.log("[Bluetooth] Périphérique sélectionné:", bluetoothDevice.name);

  bluetoothDevice.addEventListener(
    "gattserverdisconnected",
    handleBluetoothDisconnected,
  );

  console.log("[Bluetooth] Connexion GATT...");

  const server = await bluetoothDevice.gatt.connect();

  console.log("[Bluetooth] Bluetooth connecté.");

  const service = await server.getPrimaryService(SERVICE_UUID);

  console.log("[Bluetooth] Service HM-10 récupéré.");

  bluetoothCharacteristic =
    await service.getCharacteristic(CHARACTERISTIC_UUID);

  console.log("[Bluetooth] Caractéristique HM-10 récupérée.");

  await bluetoothCharacteristic.startNotifications();

  bluetoothCharacteristic.addEventListener(
    "characteristicvaluechanged",
    handleBluetoothData,
  );

  console.log("[Bluetooth] Notifications activées.");

  console.log("[Bluetooth] HM-10 connecté et prêt.");
}

/**
 * Handles data received from the Arduino through HM-10.
 *
 * Data is kept as binary data because PassCube uses a binary communication protocol.
 *
 * @param {Event} event
 * @returns {void}
 */
function handleBluetoothData(event) {
  const value = event.target.value;

  if (!value) {
    return;
  }

  const bytes = new Uint8Array(
    value.buffer,
    value.byteOffset,
    value.byteLength,
  );

  console.log("[Arduino RX] Frame reçue:", bytes);

  console.log(
    "[Arduino RX] HEX:",
    Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
      .join(" "),
  );
}

/**
 * Handles an unexpected Bluetooth disconnection.
 *
 * @returns {void}
 */
function handleBluetoothDisconnected() {
  console.log("[Bluetooth] HM-10 déconnecté.");

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
      console.log("[Bluetooth] Déconnexion du HM-10...");

      bluetoothDevice.gatt.disconnect();
    }
  } catch (error) {
    console.error("[Bluetooth] Erreur lors de la déconnexion:", error);
  }

  bluetoothCharacteristic = null;
  bluetoothDevice = null;

  console.log("[Bluetooth] Arduino déconnecté.");
}

/**
 * Sends a communication frame to the Arduino through the HM-10.
 *
 * The frame is sent as raw bytes.
 *
 * @param {Uint8Array} frame
 * @returns {Promise<void>}
 * @throws {Error} If the Arduino is not connected.
 */
async function sendToArduino(frame) {
  if (!isArduinoConnected()) {
    throw new Error("Arduino/HM-10 is not connected.");
  }

  if (!(frame instanceof Uint8Array)) {
    throw new TypeError("The communication frame must be a Uint8Array.");
  }

  console.log("[Arduino TX] Frame envoyée:", frame);

  console.log(
    "[Arduino TX] HEX:",
    Array.from(frame)
      .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
      .join(" "),
  );

  await bluetoothCharacteristic.writeValue(frame);

  console.log("[Arduino TX] Envoi terminé.");
}

export {
  arduinoConnection,
  arduinoDeconnection,
  sendToArduino,
  isArduinoConnected,
};
