
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
    META.projects.items[MP.prid].clip_order.forEach((item, i) => {
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
        //clip_order.push(id)
        META.projects.items[MP.prid].clip_order.push(id)
    }
    //let data = {}
    if (!META.projects.items[MP.prid].clips[id]) {
        META.projects.items[MP.prid].clips[id] = {}
    }
    META.projects.items[MP.prid].clips[id].id = id
    META.projects.items[MP.prid].clips[id].video_path = STATE.video_path
    META.projects.items[MP.prid].clips[id].video_filename = STATE.video_filename
    META.projects.items[MP.prid].clips[id].start = start.toFixed(3)
    META.projects.items[MP.prid].clips[id].end = end.toFixed(3)
    META.projects.items[MP.prid].clips[id].runtime = parseFloat(end - start).toFixed(3)

    function finishSave(){
        var canvas = document.createElement('canvas');
        canvas.height = vplayer.videoHeight;
        canvas.width = vplayer.videoWidth;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(vplayer, 0, 0, canvas.width, canvas.height);

        META.projects.items[MP.prid].clips[id].thumb = canvas.toDataURL();
        parseClipList()
        //seekClipStart()
        markClipClear()
        vplayer.currentTime = end
        // *** move to a seperte action *** save the clip to meta for this file
        //META.items[STATE.video_filename].clips[id] = cloneObj(META.projects.items[MP.prid].clips[id])
        saveMeta()
        vplayer.removeEventListener("seeked", finishSave)
    }
    vplayer.currentTime = start
    vplayer.addEventListener("seeked",finishSave)

}

function markClipArchive(){
    let id = STATE.cur_clip_id
    if (id === null) {
        return
    }

    META.items[STATE.video_filename].clips[id] = cloneObj(META.projects.items[MP.prid].clips[id])
    saveMeta()
}

function parseClipList(){
    let str = ""
    META.projects.items[MP.prid].clip_order.forEach((item, i) => {
        let data = META.projects.items[MP.prid].clips[item]
        str += `<div id="${item}" class="clipcard" >`
        str += `<img id ="img_${item}" src="${data.thumb}" />`
        str += `Start: &nbsp;${data.start} <br>`
        str += `End: &nbsp;&nbsp;&nbsp;${data.end} <br>`
        str += `Length: ${data.runtime} <br>`
        str += `</div>`
    });
    BYID("clip_list").innerHTML = str
    META.projects.items[MP.prid].clip_order.forEach((item, i) =>{
        BYID(item).addEventListener('click', (event) => {
          console.log('selected clip ', event.target.id);
          loadPrevClip(event.target.id)
        });

    })
}

//*** check for proper video in the vplayer
function loadPrevClip(id) {
    id = id.replace("img_", "")
    console.log("loadPrevClip ", id);
    let thisclip = META.projects.items[MP.prid].clips[id]
    vplayerPause()
    BYID("mark_clip_start_input").value = parseFloat(thisclip.start)
    BYID("mark_clip_end_input").value = parseFloat(thisclip.end)
    // set the vplayer src
    loadVideoFile(thisclip.video_filename, id)
    //vplayer.src = thisclip.video_path
    //*** maybe need to catch a loaed event here befor procedding
    vplayer.currentTime = parseFloat(thisclip.start)
    STATE.cur_clip_id = id
    META.projects.items[MP.prid].clip_order.forEach((item, i) => {
        BYID(item).style.outline = "none"
    });
    BYID(id).style.outline = "1px solid blue"
}



function deleteClip() {
    BYID("clip_confirm_delete_area").style.display = "inline-block"
}

function cancelDeleteClip() {
    BYID("clip_confirm_delete_area").style.display = "none"
}

function confirmDeleteClip() {
    console.log("deleting current clip");
    BYID("clip_confirm_delete_area").style.display = "none"
    delete META.projects.items[MP.prid].clips[STATE.cur_clip_id]
    // remove from clip_order
    let cindex = META.projects.items[MP.prid].clip_order.indexOf(STATE.cur_clip_id)
    let removed = META.projects.items[MP.prid].clip_order.splice(cindex,1)
    BYID("clip_list").removeChild( BYID(STATE.cur_clip_id) )
    console.log("clip_order index,value :", cindex, removed);
    saveMeta()
    markClipClear()
}
