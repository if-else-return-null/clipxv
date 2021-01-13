// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

let BYID = function (id){ return document.getElementById(id) }

function generateUUIDv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

BYID("file_load_button").addEventListener('click', setProjectFile)
BYID("mark_clip_save_btn").addEventListener('click', markClipSave)
BYID("mark_clip_clear_btn").addEventListener('click', markClipClear)

BYID("clip_play_btn").addEventListener('click', vplayerPlay)
BYID("clip_pause_btn").addEventListener('click', vplayerPause)

BYID("mark_clip_start_btn").addEventListener('click', markClipStart)
BYID("mark_clip_end_btn").addEventListener('click', markClipEnd)

BYID("seek_clip_start_btn").addEventListener('click', seekClipStart)
BYID("seek_clip_end_btn").addEventListener('click', seekClipEnd)

let vplayer = document.getElementById("vplayer")
let time_update_text = document.getElementById("time_update_text")

vplayer.addEventListener('timeupdate', (event) => {
  //console.log('The currentTime attribute has been updated. Again.');
  time_update_text.textContent = vplayer.currentTime
});



function setProjectFile(){
    let path = BYID("file_choose_video").files[0].path
    console.log(path);
    BYID("vplayer").src = path
}

let clips = []

let STATE = {}
STATE.cur_clip_id = null
//STATE.clip_start = 0
//STATE.clip_end = 0

function vplayerPlay(){
    vplayer.play()
}
function vplayerPause(){
    vplayer.pause()
}


function markClipStart(){
    let value = vplayer.currentTime
    console.log(value);
    //STATE.clip_start = value
    BYID("mark_clip_start_input").value = value
}

function markClipEnd(){
    vplayer.pause()
    let value = vplayer.currentTime
    console.log(value);
    //STATE.clip_end = value
    BYID("mark_clip_end_input").value = value
}


function seekClipStart(){
    vplayer.pause()
    let value = BYID("mark_clip_start_input").value
    vplayer.currentTime = value


}

function seekClipEnd(){
    vplayer.pause()
    let value = BYID("mark_clip_end_input").value
    vplayer.currentTime = value

}



function markClipClear(){
    //
    BYID("mark_clip_start_input").value = BYID("mark_clip_end_input").value
    BYID("mark_clip_end_input").value = vplayer.duration
    vplayer.currentTime = BYID("mark_clip_start_input").value
    STATE.cur_clip_id = null
}


function markClipSave(){
    let start = BYID("mark_clip_start_input").value
    let end = BYID("mark_clip_end_input").value
    //*** check for 0 or negative length values
    if ( end <= start ) {
        console.log("Invalid Time / length");
        return
    }
    let id = STATE.cur_clip_id
    if (id === null) {
        id = generateUUIDv4()
        STATE.cur_clip_id = id
    }
    let data = {}
    data.video_path = BYID("vplayer").src.replace("file://", "")
    data.start = BYID("mark_clip_start_input").value
    data.end = BYID("mark_clip_end_input").value

    clips.push(data)
}
