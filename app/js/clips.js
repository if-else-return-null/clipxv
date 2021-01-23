
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
    MP.clip_order.forEach((item, i) => {
        BYID(item).style.outline = "none"
    });

}


function markClipSave(){
    if ( STATE.video_path === null || STATE.video_filename === null ){
        console.log("markClipSave: Bad video path or name. ");
        return
    }

    //console.log("markClipSave:  ",BYID("mark_clip_start_input").value,BYID("mark_clip_end_input").value);
    let start = BYID("mark_clip_start_input").value.trim()
    let end = BYID("mark_clip_end_input").value.trim()
    //console.log(`markClipSave: --${start}==${end}--`);
    if ( start === end || start === "" || end === "" ) {
        console.log("markClipSave: Bad video path or name. ");
        return;
    }


    start = parseFloat(start)
    end = parseFloat(end)
    //console.log(`markClipSave:parsedFloat --${typeof(start)}==${end}--`);

    //*** check for 0 or negative length values
    if ( end <= start || isNaN(start)  || isNaN(end)  ) {
        console.log("Invalid Time / length", start, end );
        return
    }

    let id = STATE.cur_clip_id
    if (id === null) {
        id = generateUUIDv4()
        STATE.cur_clip_id = id
        //clip_order.push(id)
        MP.clip_order.push(id)
    }
    //let data = {}
    if (!MP.clips[id]) {
        MP.clips[id] = {}
    }
    MP.clips[id].id = id
    MP.clips[id].video_path = STATE.video_path
    MP.clips[id].video_filename = STATE.video_filename
    MP.clips[id].start = start.toFixed(3)
    MP.clips[id].end = end.toFixed(3)
    MP.clips[id].runtime = parseFloat(end - start).toFixed(3)

    function finishSave(){
        var canvas = document.createElement('canvas');
        canvas.height = vplayer.videoHeight;
        canvas.width = vplayer.videoWidth;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(vplayer, 0, 0, canvas.width, canvas.height);

        MP.clips[id].thumb = canvas.toDataURL();
        parseClipList()
        //seekClipStart()
        markClipClear()
        vplayer.currentTime = end
        // *** move to a seperte action *** save the clip to meta for this file
        //META.files[STATE.video_filename].clips[id] = cloneObj(MP.clips[id])
        saveMeta("mp")
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

    META.files[STATE.video_filename].clips[id] = cloneObj(MP.clips[id])
    saveMeta("files")
}

function parseClipList(){
    let str = ""
    MP.clip_order.forEach((item, i) => {
        let data = MP.clips[item]
        str += `<div id="${item}" class="clipcard" >`
        str += `<img id ="img_${item}" src="${data.thumb}" />`
        str += `Start: &nbsp;${data.start} <br>`
        str += `End: &nbsp;&nbsp;&nbsp;${data.end} <br>`
        str += `Length: ${data.runtime} <br>`
        str += `</div>`
    });
    BYID("clip_list").innerHTML = str
    MP.clip_order.forEach((item, i) =>{
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
    let thisclip = MP.clips[id]
    vplayerPause()
    BYID("mark_clip_start_input").value = parseFloat(thisclip.start)
    BYID("mark_clip_end_input").value = parseFloat(thisclip.end)
    // set the vplayer src
    loadVideoFile(thisclip.video_filename, id)
    //vplayer.src = thisclip.video_path
    //*** maybe need to catch a loaed event here befor procedding
    vplayer.currentTime = parseFloat(thisclip.start)
    STATE.cur_clip_id = id
    MP.clip_order.forEach((item, i) => {
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
    delete MP.clips[STATE.cur_clip_id]
    // remove from clip_order
    let cindex = MP.clip_order.indexOf(STATE.cur_clip_id)
    let removed = MP.clip_order.splice(cindex,1)
    BYID("clip_list").removeChild( BYID(STATE.cur_clip_id) )
    console.log("clip_order index,value :", cindex, removed);
    saveMeta("mp")
    markClipClear()
}
