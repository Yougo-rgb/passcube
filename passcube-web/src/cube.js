import { connectGanCube } from "gan-web-bluetooth";

async function cubeConnection() {
  try {
    const connection = await connectGanCube();
    return connection;
  } catch (e) {
    throw new Error("Failed to connect the cube: " + e);
  }
}

async function cubeDeconnection(connection) {
  if (!connection) {
    console.error("No cube connection.");
    return;
  }
  connection.disconnect();
  console.log("Disconnecting cube...");
}

async function cubeResetDefaultState(connection) {
  if (!connection) {
    console.error("No cube connection.");
    return;
  }

  await connection.sendCubeCommand({ type: "REQUEST_RESET" });
}

async function cubeGetCurrentFacelet(connection) {
  if (!connection) {
    console.error("No cube connection.");
    return;
  }

  return await connection.sendCubeCommand({ type: "REQUEST_FACELETS" });
}

export {
  connectGanCube,
  cubeConnection,
  cubeDeconnection,
  cubeGetCurrentFacelet,
  cubeResetDefaultState,
};
