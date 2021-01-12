// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

let BYID = function (id){ return document.getElementById(id) }

BYID("file_load_button").addEventListener('click', setProjectFile)
BYID("mark_clip_save_btn").addEventListener('click', markClipSave)
BYID("mark_clip_clear_btn").addEventListener('click', markClipClear)

BYID("mark_clip_start_btn").addEventListener('click', markClipStart)
BYID("mark_clip_end_btn").addEventListener('click', markClipEnd)

BYID("seek_clip_start_btn").addEventListener('click', seekClipStart)
BYID("seek_clip_end_btn").addEventListener('click', seekClipEnd)

let vplayer = document.getElementById("vplayer")

function setProjectFile(){
    let path = BYID("file_choose_video").files[0].path
    console.log(path);
    BYID("vplayer").src = path
}

let clips = []

let STATE = {}

//STATE.clip_start = 0
//STATE.clip_end = 0

function markClipStart(){
    let value = vplayer.currentTime
    console.log(value);
    //STATE.clip_start = value
    BYID("mark_clip_start_input").value = value
}

function markClipEnd(){
    let value = vplayer.currentTime
    console.log(value);
    //STATE.clip_end = value
    BYID("mark_clip_end_input").value = value
}


function seekClipStart(){
    let value = BYID("mark_clip_start_input").value
    vplayer.currentTime = value


}

function seekClipEnd(){
    let value = BYID("mark_clip_end_input").value
    vplayer.currentTime = value

}



function markClipClear(){
    BYID("mark_clip_start_input").value = 0
    BYID("mark_clip_end_input").value = 0
}


function markClipSave(){
    let data = {}
    data.video_path = BYID("vplayer").src.replace("file://", "")
    data.start = BYID("mark_clip_start_input").value
    data.end = BYID("mark_clip_end_input").value

    clips.push(data)
}
