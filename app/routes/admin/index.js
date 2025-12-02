const express = require("express")
const app =express.Router();


app.use("/",require("./pages"))
app.use("/auth",require("./auth"))
app.use("/national",require("./national"))
app.use("/business",require("./buisness"))
app.use("/health",require("./health"))
app.use("/politics",require("./politics"))
app.use("/tech",require("./tech"))
app.use("/world",require("./world"))
app.use("/environment",require("./environment"))
app.use("/education",require("./education"))
app.use("/entertainment",require("./entertainment"))
app.use("/science",require("./science"))
app.use("/sports",require("./sports"))
app.use("/crime",require("./crime"))
app.use("/live",require("./live"))
app.use("/ads",require("./ads"))
app.use("/leftad",require("./leftad"))
app.use("/rightads",require("./rightads"))


app.use("/subscription-plans",require("./plan"))
app.use("/main",require("./mainvideo"))


// Route: Download video with TV overlay
// app.get('/download-with-overlay/:id', async (req, res) => {
//   try {
//     const news = await National.findById(req.params.id);
//     if (!news || news.mediaType !== 'video') return res.status(404).send('Not found');

//     const inputVideo = path.join(__dirname, 'public', news.video);
//     const outputVideo = path.join(__dirname, 'public', 'downloads', `${news._id}_with_overlay.mp4`);

//     // Ensure downloads folder exists
//     if (!fs.existsSync(path.dirname(outputVideo))) {
//       fs.mkdirSync(path.dirname(outputVideo), { recursive: true });
//     }

//     const filterComplex = `
//       [0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,
//       drawtext=text='BREAKING NEWS':fontcolor=white:fontsize=48:x=20:y=20:box=1:boxcolor=red@0.8:boxborderw=10,
//       drawtext=text='${news.headline.replace(/'/g, "\\'")}':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=80:fontfile=/Windows/Fonts/Arialbd.ttf,
//       drawtext=text='${news.location.replace(/'/g, "\\'")}':fontcolor=yellow:fontsize=40:x=20:y=h-th-80:box=1:boxcolor=black@0.7,
//       drawtext=text='${new Date().toLocaleTimeString('en-IN')}':fontcolor=white:fontsize=36:x=w-tw-20:y=20
//       [v]
//     `;

//     const ffmpegCmd = ffmpeg(inputVideo)
//       .videoFilters(filterComplex)
//       .outputOptions('-c:a copy')  // Keep original audio
//       .output(outputVideo)
//       .on('end', () => {
//         res.download(outputVideo, `Etimes_${news.headline.substring(0,30)}_Breaking.mp4`, (err) => {
//           if (err) console.log(err);
//           // Optional: delete after download
//           // fs.unlinkSync(outputVideo);
//         });
//       })
//       .on('error', (err) => {
//         console.error(err);
//         res.status(500).send('Processing failed');
//       });

//     ffmpegCmd.run();

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });



module.exports = app 