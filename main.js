const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const { fork , spawn  } = require('child_process');
const os = require('os')

let mainWindow = null
let os_platform = os.platform()
let sys_temp_dir = os.tmpdir()
let user_home = app.getPath("home")
let app_data_path = app.getPath("userData")
let user_videos = app.getPath("videos")
let app_video_out = user_videos + "/clipxv"

console.log("user_home", user_home);
console.log("os_platform", os_platform);
console.log("sys_temp_dir", sys_temp_dir);
console.log("app_data_path", app_data_path);
console.log("user_videos", user_videos);

let cloneObj = function(obj){ return JSON.parse(JSON.stringify(obj))}

function createWindow () {

  mainWindow = new BrowserWindow({
    x:0,
    y:0,
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('app/index.html')
  mainWindow.webContents.openDevTools()


}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})


app.on('window-all-closed', function () {
  //if (process.platform !== 'darwin') app.quit()
  app.quit()
})



ipcMain.on('from_mainWindow', (event, data) => {
    //console.log("from_mainWindow", data)

    if (data.type === "request_file_probe"){ probeFile(data)  }
    if (data.type === "request_video_creation"){ /*VOUT.addProjectToCue(data)*/  }

})


let cmd = {ffprobe:"ffprobe", ffplay:"ffplay", ffmpeg:"ffmpeg"}
/*
//*** find / determine location of executables for { ffmpeg ffprobe } on this system
if (os_platform === "win32") {

} else {

}
*/
// ffprobe -v quiet -print_format json -show_format -show_streams 2021-01-09_08-49-26.mp4


cmd_options = {
    ffprobe_1:["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", "inputFile"]
}
let codecs = {mp4:"libx264", webm:"libvpx-vp9", ogg:"libx264"}

function probeFile(data) {
    console.log("probeFile",data);
    data.info.isProbed = true

    mainWindow.webContents.send("from_mainProcess",{ type:"file_probe_responce", success:true, info:data.info })
}


//



// returns a string such as "2020-10-13" for the given seconds since epoch or the current day if secs is undefined
function getDateNow(secs) {
    let d
    if (secs === undefined) { d = new Date() } else { d = new Date(secs) }
    let datenow  = [  d.getFullYear(),  ('0' + (d.getMonth() + 1)).slice(-2),  ('0' + d.getDate()).slice(-2)].join('-');
    return datenow
}

// returns a string such as "14:25" for the given seconds since epoch or the current time if secs is undefined
function getTimeNow(secs) {
    let d
    if (secs === undefined) { d = new Date() } else { d = new Date(secs) }
    let datenow  = [    ('0' + d.getHours() ).slice(-2),  ('0' + d.getMinutes()).slice(-2),  ('0' + d.getSeconds()).slice(-2) ].join('_');
    return datenow
}
