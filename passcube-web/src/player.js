import { TwistyPlayer } from "cubing/twisty";

/**
 * Creates a TwistyPlayer for displaying a 3x3x3 Cube.
 *
 * @type {TwistyPlayer}
 */
const twistyPlayer = new TwistyPlayer({
  puzzle: "3x3x3",
  visualization: "PG3D",
  alg: "",
  experimentalSetupAnchor: "start",
  background: "none",
  controlPanel: "none",
  hintFacelets: "floating",
  experimentalDragInput: "auto",
  tempoScale: 5,
});

/**
 * Renders the TwistyPlayer inside an HTML container.
 *
 * @param {HTMLElement} htmlContainer - The HTML container where the cube will be rendered.
 * @param {TwistyPlayer} twistyPlayer - The TwistyPlayer instance to render.
 * @returns {void}
 */
function render3x3Cube(htmlContainer, twistyPlayer) {
  htmlContainer.innerHTML = "";

  htmlContainer.appendChild(twistyPlayer);
}

export { render3x3Cube, twistyPlayer };
