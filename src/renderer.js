// Buttons


const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.on("document-opened", (_, { filePath, content }) => {
        document.getElementById("thetext").value = content;
      });

      ipcRenderer.on("document-saveas", (_, filePath ) => {
        content = document.getElementById("thetext").value;
        ipcRenderer.send("saveas-document", {filePath, content});
      });

      ipcRenderer.on("load-image", () => {
        filePath = '';
        thetext = document.getElementById("thetext");
        content = thetext.value;
        pgStart = content.substring(0,thetext.selectionEnd).lastIndexOf('//-----File: ');
        if ( pgStart >= 0 ) {
          content = content.substring(pgStart+13);
          pgEnd = content.indexOf('---');
          if ( pgEnd >= 0 ) {
            filePath = content.substring(0, pgEnd);
          }
        }
        document.getElementById("theimage").src = filePath
      });
    
});

