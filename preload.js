const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('socketApi', {
    activateSocket: (arg) => ipcRenderer.invoke('activateSocket', arg),
    onSocketStatusUpdate: (callback) => ipcRenderer.on('updateSocketState', (_, data) => {
        callback(data)
    }),
    disconnectSocket: (arg) => ipcRenderer.invoke('disconnectSocket', arg)
});