
(function () {

    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegPath);
    function baseName(str) {
        var base = new String(str).substring(str.lastIndexOf('/') + 1);
        if (base.lastIndexOf(".") != -1) {
            base = base.substring(0, base.lastIndexOf("."));
        }
        return base;
    }

    var args = process.argv.slice(2);
    args.forEach(function (val, index, array) {
        var filename = val;
        var basename = baseName(filename);
        console.log(index + ': Input File ... ' + filename);

        ffmpeg(filename)
            // Generate 720P video
            .format('mp4')
            .videoBitrate('240k')
            .output(basename+'320x240.mp4')
            .videoCodec('libx264')
            .size('320x240')

            // Generate 1080P video
            // .output(basename + '-1920x1080.mp4')
            // .videoCodec('libx264')
            // .noAudio()
            // .size('1920x1080')

            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('progress', function (progress) {
                console.log('... frames: ' + progress.frames);
            })
            .on('end', function () {
                console.log('Finished processing');
            })
            .run();

    });

})();