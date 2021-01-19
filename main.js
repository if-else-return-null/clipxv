// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')


let mainWindow = null
let user_home = app.getPath("home")
console.log("user_home", user_home);


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x:0,
    y:0,
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  runFiles(user_home)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('from_mainWindow', (event, data) => {
    console.log("from_mainWindow", data)
    if (data.type === "video_folder_path"){   }

})

setTimeout(function (){
    mainWindow.webContents.send("from_mainProcess",{type:"greet", msg:"hello", files:FILELIST[user_home]})
},5000)


let FILELIST = {}

function runFiles(thisurl) {

        console.log("FL--> Starting a folder listing", thisurl);
        startread = new Date();

        // setup new path in filelist
        FILELIST[thisurl] = {
            lastid:0 ,
            curid:0 ,
            paths:[],
            items:{} ,
            readdir_complete:false,
            mime_info_complete:false ,
            thumb_info_complete:false ,
            thumb_requests:[] ,
            lastthumbid:0,
            curthumbid:0
        }
        let filelist
        try {
            filelist = fs.readdirSync(thisurl, { })
        } catch(err) {
            console.log("Scan Dir error", err);
            //showFileListError(err)
            //delete FILELIST[thisurl]
            //return
        }

        //console.log("--> Loading path from disk",filelist);
        FILELIST[thisurl].lastid = filelist.length

        //ById("itemcount")
        for (let x = 0; x < filelist.length; x++) {
            FILELIST[thisurl].paths[x] = thisurl+"/"+filelist[x]
            FILELIST[thisurl].items[x] = {
                id:x,
                path:thisurl+"/"+filelist[x],
                location:thisurl,
                name:filelist[x]
            }
            // not used at this time
            if (x === 0 ) {

            }



            // get the file extension if any
            let testext = filelist[x]
            if (testext.startsWith(".")) { testext = testext.slice(1)  }
            if ( testext.includes(".") ) {
                testext = testext.split(".").pop()
            } else {
                testext = null
            }
            FILELIST[thisurl].items[x]["ext"] = testext
            FILELIST[thisurl].items[x]["hidden"] = false
            if (FILELIST[thisurl].items[x].name.startsWith(".") ) {
                FILELIST[thisurl].items[x]["hidden"] = true
            }
            // get item stats
            fs.lstat(FILELIST[thisurl].paths[x], {}, function(err,stats) {
                // check to see if we got stats
                if ( stats === undefined) {
                    //stats = fs.lstatSync(FILELIST[thisurl].paths[x])
                    console.log("stats undefined ", err);

                }

                // add any more stats === undefined checks here

                //console.log(stats);

                FILELIST[thisurl].curid += 1
                //FILELIST.items[x][""]

                FILELIST[thisurl].items[x]["dev"] = stats.dev
                //<number> | <bigint>
                //The numeric identifier of the device containing the file.

                FILELIST[thisurl].items[x]["ino"] = stats.ino
                //<number> | <bigint>
                //The file system specific "Inode" number for the file.

                FILELIST[thisurl].items[x]["mode"] = stats.mode
                //<number> | <bigint>
                //A bit-field describing the file type and mode.

                FILELIST[thisurl].items[x]["perms"] = '0' + (stats.mode & parseInt('777', 8)).toString(8);
                // human readable file permissions string

                FILELIST[thisurl].items[x]["nlink"] = stats.nlink
                //<number> | <bigint>
                //The number of hard-links that exist for the file.

                FILELIST[thisurl].items[x]["uid"] = stats.uid
                //<number> | <bigint>
                //The numeric user identifier of the user that owns the file (POSIX).

                FILELIST[thisurl].items[x]["gid"] = stats.gid
                //<number> | <bigint>
                //The numeric group identifier of the group that owns the file (POSIX).

                FILELIST[thisurl].items[x]["rdev"] = stats.rdev
                //<number> | <bigint>
                //A numeric device identifier if the file is considered "special".

                FILELIST[thisurl].items[x]["size"] = stats.size
                //<number> | <bigint>
                //The size of the file in bytes.

                FILELIST[thisurl].items[x]["blksize"] = stats.blksize
                //<number> | <bigint>
                //The file system block size for i/o operations.

                FILELIST[thisurl].items[x]["blocks"] = stats.blocks
                //<number> | <bigint>
                //The number of blocks allocated for this file.

                FILELIST[thisurl].items[x]["atimeMs"] = stats.atimeMs
                //<number> | <bigint>
                //The timestamp indicating the last time this file was accessed expressed in milliseconds since the POSIX Epoch.

                FILELIST[thisurl].items[x]["mtimeMs"] = stats.mtimeMs
                //<number> | <bigint>
                //The timestamp indicating the last time this file was modified expressed in milliseconds since the POSIX Epoch.

                FILELIST[thisurl].items[x]["ctimeMs"] = stats.ctimeMs
                //<number> | <bigint>
                //The timestamp indicating the last time the file status was changed expressed in milliseconds since the POSIX Epoch.

                FILELIST[thisurl].items[x]["birthtimeMs"] = stats.birthtimeMs
                //<number> | <bigint>
                //The timestamp indicating the creation time of this file expressed in milliseconds since the POSIX Epoch.

                FILELIST[thisurl].items[x]["atime"] = stats.atime
                //<Date>
                //The timestamp indicating the last time this file was accessed.

                FILELIST[thisurl].items[x]["mtime"] = stats.mtime
                //<Date>
                //The timestamp indicating the last time this file was modified.

                FILELIST[thisurl].items[x]["ctime"] = stats.ctime
                //<Date>
                //The timestamp indicating the last time the file status was changed.

                FILELIST[thisurl].items[x]["birthtime"] = stats.birthtime
                //<Date>
                //The timestamp indicating the creation time of this file.



                if (stats !== undefined) { // one more check on the stats object for unknown cases
                    // determine the the primitive filetype

                    if (stats.isDirectory()) {
                        FILELIST[thisurl].items[x]["type"] = "folder"
                        FILELIST[thisurl].items[x]["ftype"] = "folder"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_folder
                        //buildItemHtml(x, thisurl)

                    }
                    else if (stats.isSymbolicLink()) {
                        FILELIST[thisurl].items[x]["type"] = "symlink"
                        FILELIST[thisurl].items[x]["ftype"] = "symlink"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)
                        fs.readlink(FILELIST[thisurl].paths[x], {}, function(err,linkString) {
                            console.log("got symlink target", linkString);
                            FILELIST[thisurl].items[x]["symlink_target"] = linkString
                        });


                    }
                    else if (stats.isFile()) {
                        FILELIST[thisurl].items[x]["type"] = "file"
                        FILELIST[thisurl].items[x]["ftype"] = "file"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)
                    }
                    else if (stats.isFIFO()) {
                        FILELIST[thisurl].items[x]["type"] = "pipe"
                        FILELIST[thisurl].items[x]["ftype"] = "pipe"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)

                    }
                    else if (stats.isSocket()) {
                        FILELIST[thisurl].items[x]["type"] = "socket"
                        FILELIST[thisurl].items[x]["ftype"] = "socket"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)

                    }
                    else if (stats.isCharacterDevice()) {
                        FILELIST[thisurl].items[x]["type"] = "chardevice"
                        FILELIST[thisurl].items[x]["ftype"] = "chardevice"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)

                    }
                    else if (stats.isBlockDevice()) {
                        FILELIST[thisurl].items[x]["type"] = "blockdevice"
                        FILELIST[thisurl].items[x]["ftype"] = "blockdevice"

                        FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                        //buildItemHtml(x, thisurl)


                    }

                } else {
                    // some strange file like being
                    FILELIST[thisurl].items[x]["type"] = "unknown"
                    FILELIST[thisurl].items[x]["ftype"] = "unknown"
                    FILELIST[thisurl].items[x]["imgdata"] = "" //img_file
                    //buildItemHtml(x, thisurl)


                }

                // if we have stats on all the items in the folder listing then show it
                if (FILELIST[thisurl].lastid === FILELIST[thisurl].curid) {
                    console.log("FL--> Read dir complete in ", new Date() - startread ,"ms")
                    //console.log(FILELIST[thisurl]);
                    mainWindow.webContents.send("from_mainProcess",{type:"home_file_list", root:thisurl, files:FILELIST[thisurl]})
                    //process.send({ action:"filelist_update", thisurl: thisurl , filelist:FILELIST[thisurl] });
                    //showFileList(reload)
                }
            })
        }
        //if ( filelist.length === 0  ) { showFileList() } // empty folders

}
