import { app, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import socket from "./api/socket.js"

const __dirname = dirname(fileURLToPath(import.meta.url));

let win;
let tray;

function createWindow() {
    win = new BrowserWindow({
        width:1200,
        minWidth: 800,
        height:900,
        minHeight:600,
        icon : path.join(__dirname, "/assests", "/soundnode.png"),
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (app.isPackaged) {
        win.menuBarVisible = false;
        win.setMenu(null)
        win.webContents.on('devtools-opened', () => {
            win.webContents.closeDevTools();
        });
    } else {
        win.webContents.openDevTools();
    }

    win.loadURL("https://zed31rus.ru");
};

function createTray() {
    const iconPath = path.join(__dirname, "/assests", "/soundnode.png"); 
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Open', 
            click: () => {
                win.show();
                win.focus();
            } 
        },
        { 
            label: 'Close', 
            click: () => {
                app.isQuitting = true;
                app.quit();
            } 
        }
    ]);
    
    tray.setToolTip('Soundnode');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.focus();
        }
    });
}

app.on("ready", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    createTray();
})


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle('activateSocket', async (event, arg) => {
    const cookies= await win.webContents.session.cookies.get({url: 'https://zed31rus.ru'})
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join(";");
    socket(cookieHeader)
    console.log("socket activated...")
});