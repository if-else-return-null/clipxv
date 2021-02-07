
/*
window.addEventListener('DOMContentLoaded', () => {

})
*/
const ipc = require('electron').ipcRenderer;

console.log("pre-load : " , "test");

window.capi = {}

// ipc to the main process
window.capi.ipcSend = function (channel,data) {
    ipc.send(channel, data)
}


ipc.on('from_mainProcess', (event, data) => {
    //console.log("from_mainProcess", data);
    //sendToMainProcess("from_mainWindow",{type:"greet", msg:"hello"})
    handleFromMainProcess(data)
})
