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
        if (item === META.projects.prid) { selected = "selected"}
        str += `<option ${selected} value="${item}" >${META.projects.items[item]}</option>`
    }


    BYID("project_selector").innerHTML = str
    cancelDeleteProject()
}

function createNewProject(){
    META.projects.prid = generateUUIDv4()
    MP = {
        id:META.projects.prid,
        name:"untitled",
        clip_index:0,
        folder:STATE.file_chooser_path,
        clips:{} ,
        clip_order:[]
    }
    META.projects.items[META.projects.prid] = MP.name
    saveMeta("projects")
    saveMeta("mp")
    parseClipList()
    parseProjectList()
    markClipClear()
    clearVplayer()
}

function renameProject() {
    let newname = BYID("project_rename_input").value.trim()
    if (newname === "" || newname === " " ) { console.log("invalid name"); return;  }
    MP.name = newname
    META.projects.items[META.projects.prid] = newname
    BYID("project_rename_input").value = ""
    saveMeta("projects")
    saveMeta("mp")
    parseProjectList()
}

function deleteProject() {
    BYID("project_delete_btn").style.display = "none"
    BYID("project_confirm_delete_area").style.display = "inline-block"
}

function cancelDeleteProject() {
    BYID("project_delete_btn").style.display = "inline-block"
    BYID("project_confirm_delete_area").style.display = "none"
}

function confirmDeleteProject() {
    console.log("deleting current project");
    BYID("project_confirm_delete_area").style.display = "none"
    BYID("project_delete_btn").style.display = "inline-block"
    localStorage.removeItem(META.projects.prid)
    delete META.projects.items[META.projects.prid]
    //*** pick an existing project to load if none exist create a new one
    let createnew = "yes"
    for (let proj in META.projects.items){
        if ( createnew === "yes" ) {
            createnew = proj
        }
    }
    if (createnew === "yes") {
        createNewProject()
    } else {
        changeActiveProject(createnew)
    }

}

function changeActiveProject(prid) {
    META.projects.prid = prid
    saveMeta("projects")
    MP = JSON.parse(localStorage.getItem(META.projects.prid))
    parseClipList()
    parseProjectList()
    markClipClear()
    folderChooserUrl(MP.folder)
    clearVplayer()
}

let job_list = {}
function projectCreateVideo() {
    console.log("projectCreateVideo");
    let jid = generateUUIDv4()
    let out_ops = {
        h:1080,
        w:1920,
        container:"mp4"
    }
    capi.ipcSend("from_mainWindow",{ type:"request_video_creation", jid:jid, mp:MP, options:out_ops })
}


function parseFolderView(){
    /*
    if (STATE.first_load_info_visible === true) {
        console.log("clearing first load");
        STATE.first_load_info_visible = false
        BYID("first_load_info").style.display = "none"
        BYID("video_list_cont").style.width = "20%"
    }
    */
    let str = {files:"", folders:""}
    console.log("parseFolderView");
    for (var i = 0; i < FILES.paths.length; i++) {
        let item = FILES.items[i]
        if (item.type === "folder") {
            str.folders +=`<div id="${i}" class="video_list_folder" ><img id="${i}" src="assets/folder.svg" />${item.name}</div>`
        }
        else if (item.type === "file") {
            if ( item.ftype !== "file" ) {
                str.files +=`<div id="${i}" class="video_list_item" ><img id="${i}" src="assets/video.svg" />${item.name}</div>`
            }
        }
        else {
            // other files
        }

    }
    let head = `<div  class="video_list_path" >${STATE.file_chooser_path}</div>`
    BYID("video_list").innerHTML = head + str.folders + str.files
}

function folderChooserHome() {
    console.log("folderChooserHome");
    capi.ipcSend("from_mainWindow",{ type:"request_file_list", url:"home" })
}
function folderChooserParent () {
    capi.ipcSend("from_mainWindow",{ type:"request_file_list", url:"parent" })
}
function folderChooserUrl(url) {
    console.log("folderChooserUrl", url);
    capi.ipcSend("from_mainWindow",{ type:"request_file_list", url:url })
}


function clearVplayer() {
    BYID("vplayer").src = ""
    BYID("loaded_video_text").textContent = "Empty"
    STATE.video_filename = null
    STATE.video_path = null
    time_update_text.textContent = vplayer.currentTime
}

function loadVideoFile(fn , id = null ) {
    console.log("loadVideoFile ",fn, id);
    let path, name

    if (id === null) {
        path = FILES.items[fn].path
        name = FILES.items[fn].name
    } else {
        path = MP.clips[id].video_path
        name = MP.clips[id].video_filename
    }
    if ( path === null || name === null ){
        console.log("loadVideoFile: Bad path or name. ");
        return
    }
    BYID("vplayer").src = path
    BYID("loaded_video_text").textContent = name
    STATE.video_filename = name
    STATE.video_path = path
    if (!META.files[STATE.video_filename]) {
        // create clip data for file
        META.files[STATE.video_filename] = {clips:{}}
        console.log("create empty video file archive data",META.files[STATE.video_filename]);
        saveMeta("files")
    }
    console.log("load video file archive data",META.files[STATE.video_filename]);
    if (id === null) {vplayer.currentTime = parseFloat(0.01)}
    parseArchivedClips()
}

function parseArchivedClips() {
    let str = ""
    let clips = META.files[STATE.video_filename].clips
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


function handleFromMainProcess(data) {
    //console.log("from_mainProcess", data);
    if (data.type = "file_chooser_path") {
        FILES = data.files
        STATE.file_chooser_path = data.root
        MP.folder = data.root
        saveMeta("mp")
        parseFolderView(data.root)
        /*
        if (STATE.first_load_info_visible === false) {

        }
        */
    }
    if (data.type = "video_folder_path") {

    }
}
