import {
  cubeConnection,
  cubeDeconnection,
  cubeGetCurrentFacelet,
  cubeResetDefaultState,
  isCubeConnected,
} from "./cube";

import {
  arduinoConnection,
  arduinoDeconnection,
  isArduinoConnected,
} from "./arduino";

import {
  checkPassword,
  setNewPassword,
} from "./password";

import {
  twistyPlayer,
  render3x3Cube,
} from "./player";

const statusTxt =
  document.getElementById("status_txt");

const cubePlayer =
  document.getElementById("cube_player");

const cubeConnectBtn =
  document.getElementById("cube_connect_btn");

const cubeDeconnectBtn =
  document.getElementById("cube_deconnect_btn");

const cubeResetStateBtn =
  document.getElementById("cube_reset_state_btn");

const arduinoConnectBtn =
  document.getElementById("arduino_connect_btn");

const arduinoDeconnectBtn =
  document.getElementById("arduino_deconnect_btn");

const setNewPassBtn =
  document.getElementById("set_new_pass_btn");

const checkPassBtn =
  document.getElementById("check_pass_btn");

let cubeConnectionInstance = null;

/*
 * firstTime is true until the first password
 * has successfully been created.
 */
let firstTime = true;

/*
 * Becomes true after a successful password check.
 */
let accessGranted = false;

/**
 * Updates the visibility and enabled state
 * of all interface elements.
 *
 * @returns {void}
 */
function updateUI() {
  const cubeConnected =
    isCubeConnected(cubeConnectionInstance);

  const arduinoConnected =
    isArduinoConnected();

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

  // Password controls require both devices
  const devicesConnected =
    cubeConnected && arduinoConnected;

  /*
   * Checking the password is always possible
   * once both devices are connected.
   */
  checkPassBtn.hidden = !devicesConnected;
  checkPassBtn.disabled = !devicesConnected;

  /*
   * The first password can be created without
   * accessGranted.
   *
   * After the first password has been created,
   * accessGranted is required.
   */
  setNewPassBtn.hidden = !devicesConnected;

  if (firstTime) {
    setNewPassBtn.disabled = !devicesConnected;
  } else {
    setNewPassBtn.disabled =
      !devicesConnected || !accessGranted;
  }
}

/**
 * Displays a status message to the user.
 *
 * @param {string} message
 * @returns {void}
 */
function setStatus(message) {
  if (statusTxt) {
    statusTxt.innerText = message;
  }
}

updateUI();

/**
 * Cube connection.
 */
cubeConnectBtn.addEventListener(
  "click",
  async () => {
    setStatus("Connecting...");

    try {
      cubeConnectionInstance =
        await cubeConnection();

      setStatus(
        "Connection successful!",
      );

      render3x3Cube(
        cubePlayer,
        twistyPlayer,
      );

      await cubeConnectionInstance.sendCubeCommand({
        type: "REQUEST_FACELETS",
      });
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

      console.error(
        "Cube connection failed:",
        e,
      );
    }

    updateUI();
  },
);

/**
 * Cube disconnection.
 */
cubeDeconnectBtn.addEventListener(
  "click",
  async () => {
    try {
      cubeDeconnection(
        cubeConnectionInstance,
      );

      cubeConnectionInstance = null;

      /*
       * A cube disconnection invalidates
       * the current authorization.
       */
      accessGranted = false;

      setStatus(
        "Cube disconnected.",
      );
    } catch (e) {
      console.error(
        "Cube disconnection failed:",
        e,
      );
    }

    updateUI();
  },
);

/**
 * Reset cube state.
 */
cubeResetStateBtn.addEventListener(
  "click",
  async () => {
    try {
      await cubeResetDefaultState(
        cubeConnectionInstance,
      );

      setStatus(
        "Cube state reset.",
      );
    } catch (e) {
      console.error(
        "Cube reset failed:",
        e,
      );
    }

    updateUI();
  },
);

/**
 * Arduino connection.
 */
arduinoConnectBtn.addEventListener(
  "click",
  async () => {
    try {
      await arduinoConnection();

      setStatus(
        "Arduino connected.",
      );
    } catch (e) {
      console.error(
        "Arduino connection failed:",
        e,
      );

      setStatus(
        "Arduino connection failed.",
      );
    }

    updateUI();
  },
);

/**
 * Arduino disconnection.
 */
arduinoDeconnectBtn.addEventListener(
  "click",
  async () => {
    try {
      await arduinoDeconnection();

      /*
       * Disconnecting the Arduino invalidates
       * the current authorization.
       */
      accessGranted = false;

      setStatus(
        "Arduino disconnected.",
      );
    } catch (e) {
      console.error(
        "Arduino disconnection failed:",
        e,
      );
    }

    updateUI();
  },
);

/**
 * Set a new password.
 *
 * First use:
 *     No password verification is required.
 *
 * After the first password has been created:
 *     ACCESS_GRANTED is required.
 */
setNewPassBtn.addEventListener(
  "click",
  async () => {
    /*
     * During normal operation, changing the
     * password requires a successful check.
     *
     * During first setup, this condition is
     * intentionally bypassed.
     */
    if (!firstTime && !accessGranted) {
      setStatus(
        "Access denied. Verify the password first.",
      );

      return;
    }

    try {
      setStatus(
        "Setting new password...",
      );

      const currentFacelet =
        await cubeGetCurrentFacelet(
          cubeConnectionInstance,
        );

      const response =
        await setNewPassword(
          currentFacelet,
        );

      if (response === "ACK") {
        /*
         * The first password has now been
         * successfully created.
         */
        if (firstTime) {
          firstTime = false;
        }

        /*
         * Changing the password invalidates
         * the previous authorization.
         */
        accessGranted = false;

        setStatus(
          "New password set.",
        );
      } else if (
        response === "NAK"
      ) {
        setStatus(
          "Password setup rejected.",
        );
      } else {
        setStatus(
          "Password setup failed.",
        );
      }
    } catch (e) {
      console.error(
        "Setting new password failed:",
        e,
      );

      setStatus(
        "Failed to set new password.",
      );
    }

    updateUI();
  },
);

/**
 * Check the current password.
 */
checkPassBtn.addEventListener(
  "click",
  async () => {
    /*
     * There is no password to check before
     * the first password has been created.
     */
    if (firstTime) {
      setStatus(
        "Set a password first.",
      );

      return;
    }

    try {
      setStatus(
        "Checking password...",
      );

      const currentFacelet =
        await cubeGetCurrentFacelet(
          cubeConnectionInstance,
        );

      const response =
        await checkPassword(
          currentFacelet,
        );

      if (
        response === "ACCESS_GRANTED"
      ) {
        accessGranted = true;

        setStatus(
          "Access granted.",
        );
      } else if (
        response === "ACCESS_DENIED"
      ) {
        accessGranted = false;

        setStatus(
          "Access denied.",
        );
      } else if (
        response === "NAK"
      ) {
        accessGranted = false;

        setStatus(
          "Password verification rejected.",
        );
      } else {
        accessGranted = false;

        setStatus(
          "Password verification failed.",
        );
      }
    } catch (e) {
      accessGranted = false;

      console.error(
        "Password verification failed:",
        e,
      );

      setStatus(
        "Password verification failed.",
      );
    }

    updateUI();
  },
);
