
vplayer.addEventListener('timeupdate', (event) => {
  //console.log('The currentTime attribute has been updated. Again.');
  time_update_text.textContent = vplayer.currentTime
  if (STATE.playing_whole_clip === true) {
      // check for clip end
      if( vplayer.currentTime >= MP.clips[STATE.cur_clip_id].end) {
          vplayerPause()
          STATE.playing_whole_clip = false
      }
  }
});


BYID("file_choose_video_home").addEventListener('click', folderChooserHome)
BYID("file_choose_video_parent").addEventListener('click', folderChooserParent)

BYID("mark_clip_save_btn").addEventListener('click', markClipSave)
BYID("mark_clip_clear_btn").addEventListener('click', markClipClear)
BYID("mark_clip_archive_btn").addEventListener('click', markClipArchive)
BYID("clip_delete_btn").addEventListener('click', deleteClip)
BYID("clip_confirm_delete_btn").addEventListener('click', confirmDeleteClip)
BYID("clip_cancel_delete_btn").addEventListener('click', cancelDeleteClip)
BYID("play_whole_clip_btn").addEventListener('click', playWholeClip)


BYID("clip_play_btn").addEventListener('click', vplayerPlay)
BYID("clip_pause_btn").addEventListener('click', vplayerPause)
BYID("seek_clip_start_btn").addEventListener('click', seekClipStart)
BYID("seek_clip_end_btn").addEventListener('click', seekClipEnd)
BYID("time_ahead_1").addEventListener('click', seekClipTime)
BYID("time_ahead_5").addEventListener('click', seekClipTime)
BYID("time_back_1").addEventListener('click', seekClipTime)
BYID("time_back_5").addEventListener('click', seekClipTime)
BYID("time_ahead_0.1").addEventListener('click', seekClipTime)
BYID("time_ahead_1.0").addEventListener('click', seekClipTime)
BYID("time_back_1.0").addEventListener('click', seekClipTime)
BYID("time_back_0.1").addEventListener('click', seekClipTime)

BYID("clip_position_up").addEventListener('click', moveClipUp)
BYID("clip_position_down").addEventListener('click', moveClipDown)

BYID("mark_clip_start_btn").addEventListener('click', markClipStart)
BYID("mark_clip_end_btn").addEventListener('click', markClipEnd)



BYID("project_new_btn").addEventListener('click', createNewProject)
BYID("project_rename_btn").addEventListener('click', renameProject)
BYID("project_delete_btn").addEventListener('click', deleteProject)
BYID("project_confirm_delete_btn").addEventListener('click', confirmDeleteProject)
BYID("project_cancel_delete_btn").addEventListener('click', cancelDeleteProject)

BYID("project_create_video_btn").addEventListener('click', projectCreateVideo)

BYID("video_list").addEventListener('click', (event) => {
  console.log('selected video file ', event.target.id);
  let fn = event.target.id
  if (FILES.items[fn]){
      console.log(FILES.items[fn]);
      if (FILES.items[fn].type === "folder") {
          folderChooserUrl(FILES.paths[fn])
      } else {

          markClipClear()
          loadVideoFile(fn)
      }

  }

  //loadPrevClip(event.target.id)
});

BYID("project_selector").addEventListener('change', (event) => {
  console.log('selected project is ', BYID(event.target.id).value);
  changeActiveProject(BYID(event.target.id).value)

});



BYID("archive_clip_list").addEventListener('click', (event) => {

  let id = event.target.id.replace("arcimg_","").replace("arc_","")
  if (id === "archive_clip_list") { return; }
  console.log('selected archived video clip ', id);
  let thisclip = META.files[STATE.video_filename].clips[id]
  markClipClear()
  BYID("mark_clip_start_input").value = parseFloat(thisclip.start)
  BYID("mark_clip_end_input").value = parseFloat(thisclip.end)
  vplayer.currentTime = parseFloat(thisclip.start)

});

// start up calls

// setup Transition selectors

parseTransitionSelectors()

// if there is no current project create one
if (META.projects.prid === null) {
    // create a new project id
    createNewProject()
    folderChooserHome()

} else {
    console.log("test",META.projects.prid, MP);
    folderChooserUrl(MP.folder)
    parseClipList()
    parseProjectList()
    setTimeout(function(){


    }, 1000)


}
