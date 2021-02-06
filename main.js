// Modules to control application life and create native browser window
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
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  //runFiles(user_home)

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
    //console.log("from_mainWindow", data)
    if (data.type === "request_file_list"){ runFiles(data.url)  }
    if (data.type === "request_video_creation"){ VOUT.addProjectToCue(data)  }

})

setTimeout(function (){
    //mainWindow.webContents.send("from_mainProcess",{type:"greet", msg:"hello", files:FILELIST[user_home]})
},5000)



// ffmpeg -i video.mp4 -ss 00:01:00 -to 00:02:00 -c copy cut.mp4
//ffmpeg -f concat -safe 0 -i mylist.txt -c copy output.wav
//ffprobe -v quiet -print_format json -show_format -show_streams 2021-01-09_08-49-26.mp4
//*** determine commands for this system
let cmd = {ffprobe:"ffprobe", ffplay:"ffplay", ffmpeg:"ffmpeg"}
cmd_options = {
    cut_clip:["-i", "inputVideo", "-ss", "startTime", "-to", "endTime", "-c", "copy", "outputFile"],
    concat_clips:["-f", "concat", "-safe", "0", "-i", "cliplist", "-c", "copy", "outputFile"],
    ffprobe_1:["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", "inputFile"],
    resize_opt:["-vf", `scale=WIDTH:HEIGHT:force_original_aspect_ratio=decrease,pad=WIDTH:HEIGHT:(ow-iw)/2:(oh-ih)/2,setsar=1`]
}
let codecs = {mp4:"libx264", webm:"libvpx-vp9", ogg:"libx264"}
/*
if (os_platform === "win32") {

} else {

}
*/





let VOUT = {}
VOUT.isWorking = false
VOUT.project_cue = []
VOUT.job = null

VOUT.addProjectToCue = function (data) {
    VOUT.project_cue.push(data)
    console.log("VOUT: Adding new project to cue.");
    if ( VOUT.isWorking === true ) {
        return
    } else {
        VOUT.parseCueItem()
    }


}

VOUT.parseCueItem = function() {
    if ( VOUT.project_cue.length === 0 ) {
        console.log("VOUT: Nothing to parse.");
        VOUT.isWorking = false
        return
    }
    VOUT.isWorking = true
    console.log("VOUT: Parsing Cue Item");
    VOUT.job = VOUT.project_cue.shift()
    VOUT.job.vpaths = {}
    VOUT.job.vorder = []
    VOUT.cutid = 0
    // determine which clips to render
    VOUT.job.mp.clip_order.forEach((item, i) => {
        if (VOUT.job.mp.clips[item].render === true) {
            VOUT.job.vorder.push(item)
            let vpath = VOUT.job.mp.clips[item].video_path
            VOUT.job.vpaths[vpath] = vpath
        }
    });
    console.log(VOUT.job.vorder,VOUT.job.vpaths );
    // check that needed video paths exist
    let pathsOk = true
    for (let path in VOUT.job.vpaths) {
        if (!fs.existsSync(path)) {
            pathsOk = false
        }
    }
    if (pathsOk = false) {
        console.log("VOUT:ERROR:  Some Video files do not exist");
        //*** maybe have to clean up VOUT object and check for more jobs
        return
    }
    // all videos exist so lets cut the clips
    VOUT.job.dir = app_video_out + "/" + getDateNow() +"_"+ getTimeNow() +"("+ VOUT.job.mp.name.trim() +")"

    console.log("VOUT:job.dir: ", VOUT.job.dir);
    fs.mkdirSync(VOUT.job.dir + "/clips", {recursive:true})

    VOUT.compareSourceFormats()



}

VOUT.comp_cout_1 = []

VOUT.compareSourceFormats = function () {
    if (VOUT.comp_cout_1.length === 0) {
        for ( let path in VOUT.job.vpaths){
            VOUT.comp_cout_1.push(path)
        }
    }

    let options = cloneObj(cmd_options.ffprobe_1)
    options[6] = VOUT.comp_cout_1.pop()
    //console.log(options);
    VOUT.job.vpaths[options[6]] = ""
    let probespawn = spawn(cmd.ffprobe, options)
    probespawn.stdout.on('data', (data) => { VOUT.job.vpaths[options[6]] += data });
    probespawn.stderr.on('data', (data) => { console.log("stderr",data.toString());});
    probespawn.on('exit', (code) => {
      console.log(`probespawn exited with code ${code}`);
      //console.log(VOUT.job.vpaths[options[6]]);
      // this job is done check for any more in the cue
      VOUT.job.vpaths[options[6]] = JSON.parse(VOUT.job.vpaths[options[6]])
      if (VOUT.comp_cout_1.length === 0) {
          console.log("all done compareSourceFormats");
          //console.log(VOUT.job.vpaths);
          VOUT.cutClips()
      } else {
          VOUT.compareSourceFormats()
      }

    });


}



//["-i", "inputVideo", "-ss", "startTime", "-to", "endTime", "-c", "copy" "outputFile"]
VOUT.cutClips = function() {
    if (VOUT.cutid === VOUT.job.vorder.length){
        console.log("VOUT: All done cutting clips");
        // call the next step
        VOUT.buildTransitions()
        return;
    }
    let clipid = VOUT.job.vorder[VOUT.cutid] // uuid from client
    let clip = VOUT.job.mp.clips[clipid]
    let  ext = clip.video_path.split(".").pop().toLowerCase()
    let stream = VOUT.job.vpaths[clip.video_path].streams[0]
    console.log("STREAM",stream);
    // check video container
    let force_encode = false
    let formats = VOUT.job.vpaths[clip.video_path].format.format_name.split(",")
    if ( !formats.includes(VOUT.job.options.container)) {
        ext = VOUT.job.options.container
        force_encode = true
    }
    // check video geometry
    let force_resize = false
    pwxh = VOUT.job.options.w + "x" + VOUT.job.options.h
    vwxh = VOUT.job.vpaths[clip.video_path].streams[0].width + "x" + VOUT.job.vpaths[clip.video_path].streams[0].height
    if (vwxh !== pwxh) {
        force_encode = true
        force_resize = true
    }

    clip.clip_filename = clipid +"."+ ext
    clip.clip_path = VOUT.job.dir + "/clips/" + clip.clip_filename
    // cut_clip:["-i", "inputVideo", "-ss", "startTime", "-to", "endTime", "-c", "copy", "outputFile"],
    let options = cloneObj(cmd_options.cut_clip)
    options[1] = clip.video_path
    options[3] = clip.start
    options[5] =  clip.end
    options[8] = clip.clip_path

    // do any modification to the ffmpeg options here
    if (clip.force_encode === true || force_encode === true) {
        console.log("Forced Encoding true");
        //options.splice(6,2)
        options[6] = "-c:v"
        options[7] = codecs[ext]
    }
    // resize_opt:["-vf", "'scale=WIDTH:HEIGHT:force_original_aspect_ratio=decrease,pad=WIDTH:HEIGHT:(ow-iw)/2:(oh-ih)/2,setsar=1'"]
    if ( force_resize === true) {
        let resize = cloneObj(cmd_options.resize_opt)
        resize[1] = resize[1].replace(/WIDTH/g, VOUT.job.options.w ).replace(/HEIGHT/g, VOUT.job.options.h)
        options.splice(6,0,resize[0],resize[1])
    }

    console.log(options);
    let cutspawn = spawn(cmd.ffmpeg, options)
    cutspawn.stdout.on('data', (data) => {
        console.log("stdout",data.toString());
    });

    cutspawn.stderr.on('data', (data) => {
        console.log("stderr",data.toString());
    });

    cutspawn.on('exit', (code) => {
      console.log(`cutspawn exited with code ${code}`);
      VOUT.cutid += 1
      VOUT.cutClips()
    });


}


VOUT.buildTransitions = function () {

    // done building transitions
    VOUT.buildFinalVideo()
}

VOUT.buildFinalVideo = function () {
    let str = ""
    VOUT.job.vorder.forEach((item, i) => { //*** check this on windows
        str += `file ${VOUT.job.mp.clips[item].clip_path.replace(/ /g, "\\ ")}\n`
        //str += `file "${VOUT.job.mp.clips[item].clip_path}"\n`
    });
    console.log(str);
    fs.writeFileSync(VOUT.job.dir + "/cliplist.txt" , str)
    //concat_clips:["-f", "concat", "-safe", "0", "-i", "cliplist", "-c", "copy", "outputFile"]
    let options = cloneObj(cmd_options.concat_clips)
    options[5] = VOUT.job.dir + "/cliplist.txt"
    options[8] = VOUT.job.dir + "/final_render." + VOUT.job.options.container
    console.log(options);
    let concatspawn = spawn(cmd.ffmpeg, options)
    concatspawn.stdout.on('data', (data) => {
        console.log("stdout",data.toString());
    });

    concatspawn.stderr.on('data', (data) => {
        console.log("stderr",data.toString());
    });

    concatspawn.on('exit', (code) => {
      console.log(`concatspawn exited with code ${code}`);
      // this job is done check for any more in the cue
      VOUT.parseCueItem()
    });




}

/*
let vidpath = "/home/returnnull/vidsplit/2021-01-09_08-49-26.mp4"

let testproc = spawn(cmd.ffprobe, [ "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", vidpath  ])
//let testproc = spawn(cmd.ffprobe,["-v", "quiet", "-print_format" json", vidpath])

testproc.stdout.on('data', (data) => {
    //console.log("stdout",data.toString());
    console.log(JSON.parse(data));
});

testproc.stderr.on('data', (data) => {
    console.log("stdout",data.toString());
});

testproc.on('exit', (code) => {
  console.log(`testproc exited with code ${code}`);

});
//testproc.stdin.setEncoding = 'utf-8';

*/


//*** debug path for win32

let FILELIST = {}
let CWD = user_home
function runFiles(thisurl) {
        console.log("FL--> Starting a folder listing", thisurl);
        if (thisurl === "home") { thisurl = user_home }
        if (thisurl === "parent") {
            let parent_path = CWD.split("/")
            console.log("parent length: ",parent_path.length);
            if (parent_path.length > 2) {
                let rcwd = parent_path.pop()
                parent_path = parent_path.join("/")
                console.log("Parent folder requested ", parent_path);
                thisurl = parent_path
            } else {
                // moving into root
                thisurl = "/"
            }

        }
        let prev_url = CWD
        CWD = thisurl
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
            delete FILELIST[thisurl]
            runFiles(prev_url)
            return
        }

        //console.log("--> Loading path from disk",filelist);
        FILELIST[thisurl].lastid = filelist.length

        //ById("itemcount")
        for (let x = 0; x < filelist.length; x++) {
            let thispath = thisurl+"/"+filelist[x]
            if (thisurl === "/"){ thispath = thisurl+filelist[x] }
            FILELIST[thisurl].paths[x] = thispath
            FILELIST[thisurl].items[x] = {
                id:x,
                path:thispath,
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
                FILELIST[thisurl].curid += 1
                // check to see if we got stats
                if ( stats === undefined) {
                    //stats = fs.lstatSync(FILELIST[thisurl].paths[x])
                    console.log("stats undefined ", err);

                } else {
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


                }

                // add any more stats === undefined checks here

                //console.log(stats);


                //FILELIST.items[x][""]



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
                // test for video file extensions
                if ( FILELIST[thisurl].items[x]["type"] === "file" && FILELIST[thisurl].items[x]["ext"] !== null) {
                    //console.log("testing extension");
                    let extl = FILELIST[thisurl].items[x]["ext"].toLowerCase()
                    if (extl === "mp4") {
                        FILELIST[thisurl].items[x]["ftype"] = "video/mp4"
                    }
                    if (extl === "ogg") {
                        FILELIST[thisurl].items[x]["ftype"] = "video/ogg"
                    }
                    if (extl === "webm") {
                        FILELIST[thisurl].items[x]["ftype"] = "video/webm"
                    }
                }

                // if we have stats on all the items in the folder listing then show it
                if (FILELIST[thisurl].lastid === FILELIST[thisurl].curid) {
                    console.log("FL--> Read dir complete in ", new Date() - startread ,"ms")
                    //console.log(FILELIST[thisurl]);
                    mainWindow.webContents.send("from_mainProcess",{type:"file_chooser_path", root:thisurl, files:FILELIST[thisurl]})
                    //process.send({ action:"filelist_update", thisurl: thisurl , filelist:FILELIST[thisurl] });
                    //showFileList(reload)
                }
            })
        }
        //if ( filelist.length === 0  ) { showFileList() } // empty folders

}

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
