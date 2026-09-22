# PassCube

PassCube is a physical access-control project using a connected Rubik's Cube as an access key.

The web application connects to a compatible GAN Smart Cube through Bluetooth, displays its current state, and communicates with an Arduino Uno through the Web Serial API. The complete state of the cube is used as the key rather than the sequence of moves used to reach it.

The project is currently under development. The Arduino communication and security logic are not yet fully implemented.

---

## Installation

### Requirements

- Node.js
- An Arduino Uno
- A compatible GAN Smart Cube
- A browser supporting the required Web Bluetooth and Web Serial APIs
- Bluetooth support on the computer

### 1. Clone the repository

```bash
git clone https://github.com/Yougo-rgb/passcube.git
cd ./passcube/
```

### 2. Run the web application

From `passcube/`:

```bash
cd ./passcube-web/
```

#### 2.1 Install dependencies

```bash
npm install
```

#### 2.2 Start the development server

```bash
npm run dev
```

#### 2.3 Open the web application

The development server should be available at:

```text
http://localhost:5173/
```

### 3. Upload the Arduino project

From `passcube/`:

```bash
cd ./passcube-arduino/
```

Open `passcube-arduino.ino` with the Arduino IDE and upload the project to the Arduino Uno.

> The Arduino implementation is currently under development.

---

## Usage

1. Connect the Rubik's Cube by clicking the cube connection button. Turn a face of the cube if necessary so that the application receives an event.

   The browser may occasionally display an error indicating that the Cube MAC address could not be determined. If this happens, try connecting the Cube again.

2. Connect the Arduino Uno using the Arduino connection button.

3. Check that the state displayed by the application matches the physical Cube. If it does not, use the **Reset Cube State** button to reset the displayed state.

4. Set the Cube to the state you want to use as the access key.

5. Set the new key using the corresponding button.

6. To verify the key, set the Cube to the desired state and use the verification button.

7. The Cube and Arduino can be disconnected using their respective disconnect buttons.

---

## Browser Compatibility

PassCube requires browser support for the **Web Bluetooth API** to communicate with the Rubik's Cube and the **Web Serial API** to communicate with the Arduino.

Browser support may vary depending on the operating system and browser version.

### Desktop (Windows / macOS / Android)

Use **Google Chrome** and enable:

```
chrome://flags/#enable-experimental-web-platform-features
```

Restart your browser after enabling the flag.

### iOS / iPadOS

Use the **Bluefy** browser and enable in the browser settings:

```
ENABLE BLE Advertisement
```

---

## Cube Compatibility

PassCube uses [`gan-web-bluetooth`](https://github.com/afedotov/gan-web-bluetooth) to communicate with GAN Smart Cubes.

See the library's compatibility list for supported devices:

https://github.com/afedotov/gan-web-bluetooth?tab=readme-ov-file#gan-smart-cubes

The project has been developed and tested with a **MonsterGo AI 3x3**.

---

## Project Structure

```text
passcube/
├── passcube-web/       # Web application
└── passcube-arduino/   # Arduino project
```

---

## Technologies Used

- HTML / CSS / JavaScript
- [Vite](https://github.com/vitejs/vite): development server and build tool
- [Cubing.js](https://github.com/cubing/cubing.js): 3D Rubik's Cube visualization
- [gan-web-bluetooth](https://github.com/afedotov/gan-web-bluetooth): GAN Smart Cube communication
- Web Bluetooth API: Bluetooth communication between the browser and the Cube
- Web Serial API: serial communication between the browser and the Arduino Uno
- Arduino: physical security controller

---

## Authors

- **Hugo Pozzi** — [Yougo-rgb](https://github.com/Yougo-rgb)
- **Miguel Piquer Crespo** — [Guimel32](https://github.com/Guimel32)

---
