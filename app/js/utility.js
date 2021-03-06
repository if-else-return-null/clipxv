let BYID = function (id){ return document.getElementById(id) }
let cloneObj = function(obj){ return JSON.parse(JSON.stringify(obj))}
function generateUUIDv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}



let vplayer = document.getElementById("vplayer")
let time_update_text = document.getElementById("time_update_text")

function vplayerPlay(){
    vplayer.play()
    vplayer.focus()
}
function vplayerPause(){
    vplayer.pause()
    vplayer.focus()
}




let META = {}
META.files = {}
META.projects = { prid:null,  items:{} }

let MP
let STATE = {}

STATE.cur_clip_id = null
STATE.first_load_info_visible = true
STATE.file_chooser_path = null
STATE.video_path = null
STATE.video_filename = null
STATE.playing_whole_clip = false
STATE.file_chooser_visible = false


if (localStorage.getItem("files")){
    console.log("found meta files storage");
    META.files = JSON.parse(localStorage.getItem("files"))
    META.projects = JSON.parse(localStorage.getItem("projects"))
    MP = JSON.parse(localStorage.getItem(META.projects.prid))


} else {
    console.log("Creating meta storage");
    localStorage.setItem("files",JSON.stringify(META.files))
    localStorage.setItem("projects",JSON.stringify(META.projects))
}

function saveMeta(type = "all"){
    if (type === "files" || type === "all" ) {
        localStorage.setItem("files",JSON.stringify(META.files))
    }
    if (type === "projects" || type === "all" ) {
        localStorage.setItem("projects",JSON.stringify(META.projects))
    }
    if (type === "mp" || type === "all" ) {
        localStorage.setItem(META.projects.prid,JSON.stringify(MP))
    }

}

function showStatusNotify(info, clear = false) {
    if (clear === true) {
        BYID('status_notify_text').textContent = ""
        return
    }
    BYID('status_notify_text').textContent = info
    setTimeout(function(){ showStatusNotify("" , true)  },3000)
}
