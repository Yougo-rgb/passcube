import { connectGanCube } from 'gan-web-bluetooth';

const connect_btn = document.getElementById("connect_btn");
const status_txt = document.getElementById("status_txt");

let conn;

connect_btn.addEventListener("click", async () => {
  status_txt .innerText = "Connecting...";

  try {
    conn = await connectGanCube();

    status_txt.innerText = "Connection successful!";
    
    conn.events$.subscribe((event) => {
        if (event.type == "FACELETS") {
            console.log("Cube facelets state", event.facelets);
            console.log("Cube facelets serial", event.serial);
            console.log("Cube facelets state", event.state);
            console.log("Cube facelets timestamp", event.timestamp);
            console.log("Cube facelets type", event.type);
        } else if (event.type == "MOVE") {
            console.log("Cube move", event.move);
            console.log("Cube cubeTimestamp", event.cubeTimestamp);
            console.log("Cube direction", event.direction);
            console.log("Cube face", event.face);
            console.log("Cube loaltiemstamp", event.localTimestamp);
            console.log("Cube serial", event.serial);
            console.log("Cube timestapm", event.timestamp);
            console.log("Cube type", event.type);
            
        }
    });

    await conn.sendCubeCommand({ type: "REQUEST_FACELETS" });
  } catch (e) {
    status_txt.innerHTML = `<p>Connection failed: ${e} <br> ⚠️ Your brower may not be compatible ! <br>Check a list of <a href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md" target="_blank">supported browers here</a> or <a href="https://gist.github.com/afedotov/52057533a8b27a0277598160c384ae71" target="_blank">GAN Smart Cubes MAC address FAQ here</a>.</p>`
    console.error(e);
  }
});