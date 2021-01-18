
vplayer.addEventListener('timeupdate', (event) => {
  //console.log('The currentTime attribute has been updated. Again.');
  time_update_text.textContent = vplayer.currentTime
});



BYID("file_choose_video").addEventListener('input', setVideoFolder)
BYID("mark_clip_save_btn").addEventListener('click', markClipSave)
BYID("mark_clip_clear_btn").addEventListener('click', markClipClear)
BYID("mark_clip_archive_btn").addEventListener('click', markClipArchive)

BYID("clip_play_btn").addEventListener('click', vplayerPlay)
BYID("clip_pause_btn").addEventListener('click', vplayerPause)

BYID("mark_clip_start_btn").addEventListener('click', markClipStart)
BYID("mark_clip_end_btn").addEventListener('click', markClipEnd)

BYID("seek_clip_start_btn").addEventListener('click', seekClipStart)
BYID("seek_clip_end_btn").addEventListener('click', seekClipEnd)

BYID("project_new_btn").addEventListener('click', createNewProject)
BYID("project_rename_btn").addEventListener('click', renameProject)
BYID("project_delete_btn").addEventListener('click', deleteProject)
BYID("project_confirm_delete_btn").addEventListener('click', confirmDeleteProject)
BYID("project_cancel_delete_btn").addEventListener('click', cancelDeleteProject)

BYID("video_list").addEventListener('click', (event) => {
  console.log('selected video file ', event.target.id);
  let fn = event.target.id
  if (FILES.items[fn]){
      console.log(FILES.items[fn]);
      markClipClear()
      loadVideoFile(fn)
  }
  //loadPrevClip(event.target.id)
});
BYID("project_selector").addEventListener('change', (event) => {
  console.log('selected project is ', BYID(event.target.id).value);

  META.projects.cur_id = BYID(event.target.id).value
  parseClipList()
  parseProjectList()
  markClipClear()
});


BYID("archive_clip_list").addEventListener('click', (event) => {

  let id = event.target.id.replace("arcimg_","").replace("arc_","")
  console.log('selected archived video clip ', id);
  let thisclip = META.items[STATE.video_filename].clips[id]
  markClipClear()
  BYID("mark_clip_start_input").value = parseFloat(thisclip.start)
  BYID("mark_clip_end_input").value = parseFloat(thisclip.end)
  vplayer.currentTime = parseFloat(thisclip.start)

});

// start up calls

// if there is no current project create one
if (META.projects.cur_id === null) {
    // create a new project id
    createNewProject()

} else {

    parseClipList()
    parseProjectList()

}
