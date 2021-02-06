

# https://stackoverflow.com/questions/46671252/how-to-add-black-borders-to-video
ffmpeg -i SRC -vf 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1' DEST
