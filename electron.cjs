const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "WorkFaster",
        width: 400,
        height: 400,
        frame: false,
        titleBarStyle: "hidden",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (app.isPackaged) {
        // Production → buka hasil build Vite
        const indexPath = path.join(__dirname, "dist", "index.html");
        console.log("Loading index from:", indexPath);
        mainWindow.loadFile(indexPath).catch(err => {
            console.error("Gagal load index.html:", err);
        });
    } else {
        // Development → buka server Vite
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools();
    }

    mainWindow.setMenuBarVisibility(false);

    // Listener buat close app
    ipcMain.on("close-app", () => {
        app.quit();
    });
}

app.whenReady().then(() => {
    createMainWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
