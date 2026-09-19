import {
  cubeConnection,
  cubeDeconnection,
  cubeGetCurrentFacelet,
  cubeResetDefaultState,
  cubeGetCurrentBattery,
} from "./cube";
import {
  arduinoConnection,
  arduinoDeconnection,
  sendToArduino,
} from "./arduino";
import { claculateChecksum, buildFrame, frameStructure } from "./protocol";
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

cubeConnectBtn.addEventListener("click", async () => {
  if (statusTxt) {
    statusTxt.innerText = "Connecting...";
  }

  try {
    cubeConnectionInstance = await cubeConnection();

    if (statusTxt) {
      statusTxt.innerText = "Connection successful!";
    }

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
});

cubeDeconnectBtn.addEventListener("click", async () => {
  try {
    cubeDeconnection(cubeConnectionInstance);

    cubeConnectionInstance = null;

    if (statusTxt) {
      statusTxt.innerText = "Cube disconnected.";
    }
  } catch (e) {
    console.error("Cube disconnection failed:", e);
  }
});

cubeResetStateBtn.addEventListener("click", async () => {
  try {
    await cubeResetDefaultState(cubeConnectionInstance);

    if (statusTxt) {
      statusTxt.innerText = "Cube state reset.";
    }
  } catch (e) {
    console.error("Cube reset failed:", e);
  }
});

arduinoConnectBtn.addEventListener("click", async () => {
  try {
    await arduinoConnection();

    if (statusTxt) {
      statusTxt.innerText = "Arduino connected.";
    }
  } catch (e) {
    console.error("Arduino connection failed:", e);
  }
});

arduinoDeconnectBtn.addEventListener("click", async () => {
  try {
    await arduinoDeconnection();

    if (statusTxt) {
      statusTxt.innerText = "Arduino disconnected.";
    }
  } catch (e) {
    console.error("Arduino disconnection failed:", e);
  }
});

setNewPassBtn.addEventListener("click", async () => {
  let currentFacelet = await cubeGetCurrentFacelet(cubeConnectionInstance);
  console.log(currentFacelet);

  try {
    // TODO
    const password = "";

    await setNewPassword(password);

    if (statusTxt) {
      statusTxt.innerText = "New key set.";
    }
  } catch (e) {
    console.error("Setting new key failed:", e);
  }
});

checkPassBtn.addEventListener("click", async () => {
  try {
    await checkPassword();
  } catch (e) {
    console.error("Password verification failed:", e);
  }
});
