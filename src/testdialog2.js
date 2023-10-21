// Renderer for test dialog 2

const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {

  
});

  document.getElementById('testdialog2ok').addEventListener('click', async () => {
    const value = document.getElementById('testdialog2input').value;
    alert("Value from dialog: " + value);
    window.close();
  });

  document.getElementById('testdialog2apply').addEventListener('click', async () => {
    const value = document.getElementById('testdialog2input').value;
    alert("Value from dialog: " + value);
  });

  document.getElementById('testdialog2cancel').addEventListener('click', async () => {
    window.close();
  });
