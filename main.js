import { app, BrowserWindow, ipcMain, protocol } from "electron";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import socket from "./api/socket.js"

const __dirname = dirname(fileURLToPath(import.meta.url));

let win;

function createWindow() {
    win = new BrowserWindow({
        width:800,
        height:600,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL("https://zed31rus.ru");
};

app.on('ready', () => {
    createWindow()
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle('activateSocket', async (event, arg) => {
    const cookies= await win.webContents.session.cookies.get({url: 'https://zed31rus.ru'})
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join(";");
    socket(cookieHeader)
    console.log("socket activated...")
});