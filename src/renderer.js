// Buttons
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.on("document-opened", (_, { filePath, content }) => {
        document.getElementById("thetext").value = content;
      });

      ipcRenderer.on("document-saveas", (_, filePath ) => {
        content = document.getElementById("thetext").value;
        ipcRenderer.send("saveas-document", {filePath, content});
      });
    
});

