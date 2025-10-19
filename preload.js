const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('socketApi', {
    activateSocket: (arg) => ipcRenderer.invoke('activateSocket', arg)
});