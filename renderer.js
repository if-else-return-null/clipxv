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


//*** debug path for win32
function setProjectFile(){
    console.log(BYID("file_choose_video").files)
    let fpath = BYID("file_choose_video").files[0].path
    fpath = fpath.split("/")
    let remove = fpath.pop()
    path = fpath.join("/")
    console.log(path);
    capi.ipcSend("from_mainWindow",{type:"video_folder_path", path:path})
    //BYID("vplayer").src = path
}

let CLIPS = {}
let clip_order = []

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
    vplayerPause()
    BYID("mark_clip_start_input").value = ""
    BYID("mark_clip_end_input").value = ""
    STATE.cur_clip_id = null
    clip_order.forEach((item, i) => {
        BYID(item).style.outline = "none"
    });

}


function markClipSave(){
    let start = parseFloat(BYID("mark_clip_start_input").value)
    let end = parseFloat(BYID("mark_clip_end_input").value)
    //*** check for 0 or negative length values
    if ( end <= start ) {
        console.log("Invalid Time / length", start, end );
        return
    }
    let id = STATE.cur_clip_id
    if (id === null) {
        id = generateUUIDv4()
        STATE.cur_clip_id = id
        clip_order.push(id)
    }
    //let data = {}
    if (!CLIPS[id]) { CLIPS[id] = {}  }
    CLIPS[id].id = id
    CLIPS[id].video_path = BYID("vplayer").src.replace("file://", "")
    CLIPS[id].start = start.toFixed(3)
    CLIPS[id].end = end.toFixed(3)
    CLIPS[id].runtime = parseFloat(end - start).toFixed(3)

    function finishSave(){
        var canvas = document.createElement('canvas');
        canvas.height = vplayer.videoHeight;
        canvas.width = vplayer.videoWidth;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(vplayer, 0, 0, canvas.width, canvas.height);

        CLIPS[id].thumb = canvas.toDataURL();
        parseClipList()
        //seekClipStart()
        markClipClear()
        vplayer.currentTime = end
        vplayer.removeEventListener("seeked", finishSave)
    }
    vplayer.currentTime = start
    vplayer.addEventListener("seeked",finishSave)

}



function parseClipList(){
    let str = ""
    clip_order.forEach((item, i) => {
        let data = CLIPS[item]
        str += `<div id="${item}" class="clipcard" >`
        str += `<img id ="img_${item}" src="${data.thumb}" />`
        str += `Start: &nbsp;${data.start} <br>`
        str += `End: &nbsp;&nbsp;&nbsp;${data.end} <br>`
        str += `Length: ${data.runtime} <br>`
        str += `</div>`
    });
    BYID("clip_list").innerHTML = str
    clip_order.forEach((item, i) =>{
        BYID(item).addEventListener('click', (event) => {
          console.log('selected clip ', event.target.id);
          loadPrevClip(event.target.id)
        });

    })
}


function loadPrevClip(id) {
    id = id.replace("img_", "")
    vplayerPause()
    BYID("mark_clip_start_input").value = parseFloat(CLIPS[id].start)
    BYID("mark_clip_end_input").value = parseFloat(CLIPS[id].end)
    vplayer.currentTime = parseFloat(CLIPS[id].start)
    STATE.cur_clip_id = id
    clip_order.forEach((item, i) => {
        BYID(item).style.outline = "none"
    });
    BYID(id).style.outline = "1px solid blue"
}

setTimeout(function (){
    capi.ipcSend("from_mainWindow",{type:"greet", msg:"hello"})
},5000)


function handleFromMainProcess(data) {
    console.log("from_mainProcess", data);
    if (data.type = "video_folder_path") {

    }
}
