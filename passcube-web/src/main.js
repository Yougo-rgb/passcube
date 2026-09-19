import {
  cubeConnection,
  cubeDeconnection,
  cubeGetCurrentFacelet,
  cubeResetDefaultState,
  cubeGetCurrentBattery,
  isCubeConnected,
} from "./cube";
import {
  arduinoConnection,
  arduinoDeconnection,
  sendToArduino,
  isArduinoConnected,
} from "./arduino";
import { checkPassword, setNewPassword, xorEncryption } from "./password";
import { twistyPlayer, render3x3Cube } from "./player";

const statusTxt = document.getElementById("status_txt");
const cubePlayer = document.getElementById("cube_player");

const cubeConnectBtn = document.getElementById("cube_connect_btn");
const cubeDeconnectBtn = document.getElementById("cube_deconnect_btn");
const cubeResetStateBtn = document.getElementById("cube_reset_state_btn");

const arduinoConnectBtn = document.getElementById("arduino_connect_btn");
const arduinoDeconnectBtn = document.getElementById("arduino_deconnect_btn");

const setNewPassBtn = document.getElementById("set_new_pass_btn");
const checkPassBtn = document.getElementById("check_pass_btn");

let cubeConnectionInstance = null;

/**
 * Updates the visibility and enabled state of all interface elements.
 *
 * The cube must be connected before using cube-related actions.
 *
 * The Arduino must be connected before setting or checking a password.
 *
 * @returns {void}
 */
function updateUI() {
  const cubeConnected = isCubeConnected(cubeConnectionInstance);
  const arduinoConnected = isArduinoConnected();

  // Cube connection buttons
  cubeConnectBtn.hidden = cubeConnected;
  cubeConnectBtn.disabled = cubeConnected;

  cubeDeconnectBtn.hidden = !cubeConnected;
  cubeDeconnectBtn.disabled = !cubeConnected;

  // Cube controls
  cubeResetStateBtn.hidden = !cubeConnected;
  cubeResetStateBtn.disabled = !cubeConnected;

  // Cube visualisation
  cubePlayer.hidden = !cubeConnected;

  // Arduino connection buttons
  arduinoConnectBtn.hidden = arduinoConnected;
  arduinoConnectBtn.disabled = arduinoConnected;

  arduinoDeconnectBtn.hidden = !arduinoConnected;
  arduinoDeconnectBtn.disabled = !arduinoConnected;

  // Password controls require both devices to be connected
  const devicesConnected = cubeConnected && arduinoConnected;

  setNewPassBtn.hidden = !devicesConnected;
  setNewPassBtn.disabled = !devicesConnected;

  checkPassBtn.hidden = !devicesConnected;
  checkPassBtn.disabled = !devicesConnected;
}

/**
 * Displays a status message to the user.
 *
 * @param {string} message - The message to display.
 * @returns {void}
 */
function setStatus(message) {
  if (statusTxt) {
    statusTxt.innerText = message;
  }
}

updateUI();

cubeConnectBtn.addEventListener("click", async () => {
  setStatus("Connecting...");

  try {
    cubeConnectionInstance = await cubeConnection();

    setStatus("Connection successful!");

    render3x3Cube(cubePlayer, twistyPlayer);

    await cubeConnectionInstance.sendCubeCommand({ type: "REQUEST_FACELETS" });
  } catch (e) {
    if (statusTxt) {
      statusTxt.innerHTML = `
                <p>
                    Connection failed: ${e}
                    <br>
                    ⚠️ Your browser may not be compatible!
                    <br>
                    Check the list of
                    <a
                        href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        supported browsers here
                    </a>
                    or check the
                    <a
                        href="https://gist.github.com/afedotov/52057533a8b27a0277598160c384ae71"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GAN Smart Cubes MAC address FAQ here
                    </a>.
                </p>
            `;
    }

    console.error("Cube connection failed:", e);
  }
  updateUI();
});

cubeDeconnectBtn.addEventListener("click", async () => {
  try {
    cubeDeconnection(cubeConnectionInstance);

    cubeConnectionInstance = null;

    setStatus("Cube disconnected.");
  } catch (e) {
    console.error("Cube disconnection failed:", e);
  }
  updateUI();
});

cubeResetStateBtn.addEventListener("click", async () => {
  try {
    await cubeResetDefaultState(cubeConnectionInstance);

    setStatus("Cube state reset.");
  } catch (e) {
    console.error("Cube reset failed:", e);
  }
  updateUI();
});

arduinoConnectBtn.addEventListener("click", async () => {
  try {
    await arduinoConnection();

    setStatus("Arduino connected.");
  } catch (e) {
    console.error("Arduino connection failed:", e);
  }
  updateUI();
});

arduinoDeconnectBtn.addEventListener("click", async () => {
  try {
    await arduinoDeconnection();

    setStatus("Arduino disconnected.");
  } catch (e) {
    console.error("Arduino disconnection failed:", e);
  }
  updateUI();
});

setNewPassBtn.addEventListener("click", async () => {
  const currentFacelet = await cubeGetCurrentFacelet(cubeConnectionInstance);

  try {
    await setNewPassword(currentFacelet);

    setStatus("New key set.");
  } catch (e) {
    console.error("Setting new key failed:", e);
  }
  updateUI();
});

checkPassBtn.addEventListener("click", async () => {
  const currentFacelet = await cubeGetCurrentFacelet(cubeConnectionInstance);

  try {
    await checkPassword(currentFacelet);

    setStatus("Check key set.");
  } catch (e) {
    console.error("Password verification failed:", e);
  }
  updateUI();
});
