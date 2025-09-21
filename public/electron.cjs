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

    // Cek environment
    if (process.env.NODE_ENV === "development") {
        // Saat dev → buka Vite server
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools(); // auto buka DevTools
    } else {
        // Saat production → buka hasil build dist
        const indexPath = path.resolve(__dirname, "../dist/index.html");
        console.log("Loading index from:", indexPath);
        mainWindow.loadFile(indexPath);
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
