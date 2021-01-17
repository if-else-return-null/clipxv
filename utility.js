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
}
function vplayerPause(){
    vplayer.pause()
}



let FILES = {}
let META = {}
META.items = {}
META.projects = { cur_id:null, items:{} } //e2d7767b-75f3-4b5d-b18a-6c52e18a6b47
let STATE = {}
STATE.cur_clip_id = null


if (localStorage.getItem("meta")){
    console.log("found meta storage");
    META = JSON.parse(localStorage.getItem("meta"))
    //CLIPS = META.projects.items[META.projects.cur_id].clips
    //clip_order = META.projects.items[META.projects.cur_id].clip_order

} else {
    console.log("Creating meta storage");
    localStorage.setItem("meta",JSON.stringify(META))
}

function saveMeta(){
    localStorage.setItem("meta",JSON.stringify(META))
}
