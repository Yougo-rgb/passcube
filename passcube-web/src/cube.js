import { connectGanCube } from "gan-web-bluetooth";
import { twistyPlayer } from "./player";

/**
 * Stores the current state of the GAN Smart Cube.
 *
 * @property {*} facelets - The current facelet state of the cube.
 * @property {*} battery - The current battery level of the cube.
 */
const cubeState = {
  facelets: null,
  battery: null,
};

/**
 * Stores the resolve functions of Promises waiting for a facelet or battery event.
 *
 * These variables are set when a function requests data from the cube and are called by handleCubeEvent when the corresponding event is received.
 *
 * @type {Function|null}
 */
let pendingFacelets = null;
let pendingBattery = null;

/**
 * Creates a connection with a GAN Smart Cube using the connectGanCube function from the gan-web-bluetooth library.
 *
 * @returns {Promise<Object>} The connection object.
 * @throws {Error} If the connection fails.
 */
async function cubeConnection() {
  try {
    const connection = await connectGanCube();

    connection.events$.subscribe(handleCubeEvent);

    return connection;
  } catch (e) {
    throw new Error("Failed to connect the cube: " + e);
  }
}

/**
 * Checks whether a connection with a GAN Smart Cube exists.
 *
 * @param {Object} connection - The cube connection to check.
 * @returns {boolean} True if the connection exists, otherwise false.
 */
function checkCubeConnection(connection) {
  if (!connection) {
    console.error("No cube connection.");
    return false;
  }

  return true;
}

/**
 * Handles events received from the GAN Smart Cube.
 *
 * Updates the cube state and resolves pending Promises when the requested information is received.
 *
 * @param {Object} event - The event received from the cube.
 * @returns {void}
 */
function handleCubeEvent(event) {
  switch (event.type) {
    case "FACELETS":
      cubeState.facelets = event.facelets;

      if (pendingFacelets) {
        pendingFacelets(event.facelets);
        pendingFacelets = null;
      }

      break;

    case "BATTERY":
      cubeState.battery = event.batteryLevel;

      if (pendingBattery) {
        pendingBattery(event.batteryLevel);
        pendingBattery = null;
      }

      console.log("Battery:", event.batteryLevel);
      break;

    case "MOVE":
      twistyPlayer.experimentalAddMove(event.move, { cancel: false });
      break;

    case "DISCONNECT":
      console.log("Cube disconnected.");
      break;

    default:
      console.log("Unknown cube event:", event);
  }
}

/**
 * Disconnects the GAN Smart Cube.
 *
 * @param {Object} connection - The cube connection to disconnect.
 * @returns {void}
 */
function cubeDeconnection(connection) {
  if (!checkCubeConnection(connection)) return;

  connection.disconnect();
  console.log("Disconnecting cube...");
}

/**
 * Resets the GAN Smart Cube and the twisty player to its default state.
 *
 * @param {Object} connection - The cube connection.
 * @returns {Promise<void>}
 */
async function cubeResetDefaultState(connection) {
  if (!checkCubeConnection(connection)) return;

  await connection.sendCubeCommand({ type: "REQUEST_RESET" });

  // Reset 3D cube visualisation
  if (twistyPlayer) {
    twistyPlayer.alg = "";
  }
}

/**
 * Requests the current facelet state of the GAN Smart Cube.
 *
 * The function waits for the FACELETS event before returning the result.
 *
 * @param {Object} connection - The cube connection.
 * @returns {Promise<*>} The current facelet state of the cube.
 */
async function cubeGetCurrentFacelet(connection) {
  if (!checkCubeConnection(connection)) return;

  const faceletsPromise = new Promise((resolve) => {
    pendingFacelets = resolve;
  });

  await connection.sendCubeCommand({ type: "REQUEST_FACELETS" });

  return await faceletsPromise;
}

/**
 * Requests the current battery level of the GAN Smart Cube.
 *
 * The function waits for the BATTERY event before returning the result.
 *
 * @param {Object} connection - The cube connection.
 * @returns {Promise<*>} The current battery level of the cube.
 */
async function cubeGetCurrentBattery(connection) {
  if (!checkCubeConnection(connection)) return;

  const batteryPromise = new Promise((resolve) => {
    pendingBattery = resolve;
  });

  await connection.sendCubeCommand({ type: "REQUEST_BATTERY" });
  return await batteryPromise;
}

export {
  connectGanCube,
  cubeConnection,
  cubeDeconnection,
  cubeGetCurrentFacelet,
  cubeResetDefaultState,
  cubeGetCurrentBattery,
};
