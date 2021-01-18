// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


function parseProjectList () {
    let str = ""
    for ( let item in META.projects.items ) {
        let selected = ""
        let data = META.projects.items[item]
        if (item === META.projects.cur_id) { selected = "selected"}
        str += `<option ${selected} value="${item}" >${data.name}</option>`
    }


    BYID("project_selector").innerHTML = str
}

function createNewProject(){
    META.projects.cur_id = generateUUIDv4()
    META.projects.items[META.projects.cur_id] = { name:"untitled", clips:{} , clip_order:[]}
    saveMeta()
    parseClipList()
    parseProjectList()
    markClipClear()
}

function renameProject() {
    let newname = BYID("project_rename_input").value.trim()
    if (newname === "" || newname === "" ) { console.log("invalid name"); return;  }
    META.projects.items[META.projects.cur_id].name = newname
    saveMeta()
    parseProjectList()
}

function deleteProject() {
    BYID("project_confirm_delete_area").style.display = "inline-block"
}

function cancelDeleteProject() {
    BYID("project_confirm_delete_area").style.display = "none"
}

function confirmDeleteProject() {
    console.log("deleting current project");
    BYID("project_confirm_delete_area").style.display = "none"
    delete META.projects.items[META.projects.cur_id]
    createNewProject()
}



//*** debug path for win32
function setVideoFolder(){
    if (STATE.first_load_info_visible === true) {
        console.log("clearing first load");
        STATE.first_load_info_visible = false
        BYID("first_load_info").style.display = "none"
        BYID("video_list_cont").style.width = "20%"
    }
    let temp = BYID("file_choose_video").files
    FILES = { items:{}, list:[] }
    let basefolder
    for (var i = 0; i < temp.length; i++) {
        let fname = temp[i].name
        if (i === 0) {
            console.log("got first item");
            basefolder = temp[i].webkitRelativePath.split("/")[0]
            //FILES.folders[basefolder] = {}
        }
        //console.log(temp[i]);

        FILES.items[fname] = {
            path:temp[i].path,
            name:temp[i].name,
            size:temp[i].size,
            ftype:temp[i].type,

        }
        FILES.list.push(temp[i].webkitRelativePath.replace(basefolder + "/", ""))
        let str = {o:{},a:[""]}
        FILES.list.forEach((item, i) => {
            let parts = item.split("/")
            let fn = parts[ parts.length-1 ]
            if (parts.length === 1) {
                str.a[0] +=`<div id="${fn}" class="video_list_item" >${item}</div>`
            } else {
                if (!str.o[parts[0]]) {

                    str.a.push(`<div class="video_list_folder" >${parts[0]}</div>`)
                    str.o[parts[0]] = str.a.length -1
                }
                str.a[str.o[parts[0]]] +=`<div id="${fn}" class="video_list_item" >${item.replace(parts[0],"")}</div>`
            }
        });
        //console.log();
        BYID("video_list").innerHTML = str.a.join("<br>") //+ str.a.join("<br>") + str.a.join("<br>") + str.a.join("<br>")


    }
    FILES.list.sort()
    console.log("basefolder", basefolder)
    console.log(FILES)


}

function loadVideoFile(fn,id = null ) {
    console.log("loadVideoFile ",fn, id);
    let path, name
    if (id === null) {
        path = FILES.items[fn].path
        name = FILES.items[fn].name
    } else {
        path = META.projects.items[META.projects.cur_id].clips[id].video_path
        name = META.projects.items[META.projects.cur_id].clips[id].video_filename
    }
    BYID("vplayer").src = path
    STATE.video_filename = name
    STATE.video_path = path
    if (!META.items[STATE.video_filename]) {
        // create clip data for file
        META.items[STATE.video_filename] = {clips:{}}
        console.log("create empty video file archive data",META.items[STATE.video_filename]);
        saveMeta()
    }
    console.log("load video file archive data",META.items[STATE.video_filename]);
    parseArchivedClips()
}

function parseArchivedClips() {
    let str = ""
    let clips = META.items[STATE.video_filename].clips
    for (let c in clips ) {
        str += `<div id="arc_${c}" class="arc_clipcard" >`
        str += `<img id ="arcimg_${c}" src="${clips[c].thumb}" /><br>`
        str += `Start: &nbsp;${clips[c].start} <br>`
        str += `End: &nbsp;&nbsp;&nbsp;${clips[c].end} <br>`
        str += `Length: ${clips[c].runtime} <br>`
        str += `</div>`
    }
    BYID("archive_clip_list").innerHTML = str
}


//*** below here not used at this time
setTimeout(function (){
    capi.ipcSend("from_mainWindow",{type:"greet", msg:"hello"})
},5000)


function handleFromMainProcess(data) {
    console.log("from_mainProcess", data);
    if (data.type = "video_folder_path") {

    }
}
