// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

//window.addEventListener('DOMContentLoaded', () => {

//})

const ipc = require('electron').ipcRenderer;

console.log("pre-load : " , "test");

window.capi = {}

//console.log(window);
// ipc to the main process
window.capi.ipcSend = function (channel,data) {
    ipc.send(channel, data)
}

// *** not used just testing
ipc.on('from_mainProcess', (event, data) => {
    //console.log("from_mainProcess", data);
    //sendToMainProcess("from_mainWindow",{type:"greet", msg:"hello"})
    handleFromMainProcess(data)
})
