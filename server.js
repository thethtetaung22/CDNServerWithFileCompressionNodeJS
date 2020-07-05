const express = require('express')
const { extname } = require('path');
const fileUpload = require('express-fileupload')
const { v4 } = require('uuid')
const cors = require('cors')
const path = require('path');
var Jimp = require('jimp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express()
app.use(fileUpload());
app.use(cors());

app.use('/files', express.static(path.join(__dirname, './files')));
app.post('/upload',
    function (req, res) {
        console.log(req.files)
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files.file;
        let name = v4() + extname(sampleFile.name);
        console.log(name);
        const compressed = Jimp.read(sampleFile.data, (err, lenna) => {
            if (err) throw err;
            lenna
                .resize(256, 256) // resize
                .quality(100) // set JPEG quality
                .write(`files/images/${name}`); // save
        });
        console.log("Compressed :", compressed);
        res.send(`http://localhost:${port}/files/images/${name}`);
    });

app.post('/uploadVideo', function (req, res) {
    console.log(req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let inputFile = req.files.file;
    let name = v4() + extname(inputFile.name);

    inputFile.mv(`files/videos/${name}`, function (err) {
        if (err)
            return res.status(500).send(err);
    });
    ffmpeg(`files/videos/${name}`)
        // Generate 720P video
        .format('mp4')
        .videoBitrate('240k')
        .output(name + '320x240.mp4')
        .videoCodec('libx264')
        .size('320x240')
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
    res.send(`http://localhost:${port}/files/videos/${name}`);

    // ffmpeg('saisai.mkv')
    //     .output(name + '.mp4')
    //     .size('1280x720')
    //     .videoCodec('libx264')
    //     .noAudio()
    //     .on('error', function(err) {
    //         console.log('An error occurred: ' + err.message)
    //     })
    //     .on('progress', function(progress) {

    //     })
    //     .on('end', function() { 
    //         console.log('Finished processing'); 

    //     })
    //     .run();
    // const ffmpegFile = ffmpeg(inputFile).save(`files/videos/${name}`)
    //     .format('mp4')
    //     .size('640x480')
    //     .aspect('4:3')
    //     .output(`files/${name}`)
    //     .run();

    // const compressedVideo = ffmpegFile;


    // console.log("ClV", compressedVideo);

    // inputFile.mv(`files/videos/${name}`, function (err) {
    //     if (err)
    //         return res.status(500).send(err);
    //     res.send(`http://localhost:${port}/files/videos/${name}`);
    // });
}
);

app.get('/', (req, res) => res.send('Hello World!'))

const port = 3000
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))