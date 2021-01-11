// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

let BYID = function (id){ return document.getElementById(id) }

BYID("file_load_button").addEventListener('click', setProjectFile)
BYID("mark_clip_start_btn").addEventListener('click', markClipStart)
BYID("mark_clip_end_btn").addEventListener('click', markClipEnd)
BYID("mark_clip_save_btn").addEventListener('click', markClipSave)

let vplayer = document.getElementById("vplayer")

function setProjectFile(){
    let path = BYID("file_choose_video").files[0].path
    console.log(path);
    BYID("vplayer").src = path
}


function markClipStart(){
    console.log(vplayer.currentTime);
}

function markClipEnd(){
    console.log(vplayer.currentTime);
}

function markClipSave(){

}
