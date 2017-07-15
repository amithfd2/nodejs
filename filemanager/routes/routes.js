module.exports = function (express, app) {
    var path = require("path"),
        fs = require("fs"),
        dir,
        router = express.Router(),
        archiver = require('archiver'),
        formidable = require('formidable'),
        colors = require("colors");
        dirpop = dir;
        if(process.env.DPATH === undefined) {
            console.log(`
            _____________________________________________
           |                                             |
           |                                             |
           |        First set the directory path         | 
           |    Eg: type - "set DPATH=C:\Users\public"   |
           |       !! Do not set system root folders!!   |
           |    press Enter and rerun node - "node app"  |
           |                                             |
           |_____________________________________________|`.yellow)
            process.exit();
        } else {
            console.log("\nReading from  folder : ".green+process.env.DPATH .white +"\n" )
            dir = process.env.DPATH;
        }
    router.get('/', function (req, res, next) {
    //    console.log("Dirpop: "+dirpop);
        res.sendFile('files.html', {root: path.join(__dirname, "..", "views")});
    });
    router.get("/files/*", function (req, res, next) {
      //  console.log("path : " + req.url);
        var decodedURI = decodeURI(req.url)
        var dirarr = decodedURI.split('/');
        console.log("dirarray: "+dirarr)
        var dirpath = path.join(dir, dirarr.slice(2).join("/"));
        var stat = fs.lstatSync(dirpath);
       // console.log("dirpathFiles: ".yellow+dirpath .yellow)
        var isDir = fs. (dirpath).isDirectory();

        dirpop = dirpath;
       // console.log("DIr from files*: "+dirpop);
        if (isDir) {
            //    Its a directory
            fs.readdir(dirpath, function (err, files) {
                var fileObj,
                    filesArr = [];
                files.forEach(function (file) {
                    fileObj = {
                        name: file,
                        path: decodedURI + "/" + file,
                        time: fs.lstatSync(path.join(dirpath, file)).mtime.toLocaleString(),
                        isDir: fs.lstatSync(path.join(dirpath, file)).isDirectory(),
                        icon: getFileIcon(path.extname(file)),
                        size: Math.round(fs.lstatSync(path.join(dirpath, file)).size / (1024)).toString() + " KB"
                    };
                    if (fileObj.isDir) {
                        fileObj.size = " ";
                    }
                    filesArr.push(fileObj)
                });

                if (err) throw err;
                var obj = {
                    files: filesArr,
                    isDir: isDir,
                    path: decodedURI,
                    time: stat.mtime.toLocaleString(),
                    type: "dir"
                }
                return res.json(obj)
            });
        } else {
            //Its a file
          //  console.log("Its a file");
         //   console.log("file dir: "+dirpath)
            var obj = {
                type: path.extname(dirpath),
                path: dirpath,
                time: stat.mtime.toLocaleString(),
                isDirectory: isDir,
                size: (fs.lstatSync(dirpath).size / 1024).toString() + "KB"
            }
            return res.json(obj)
        }

    });

    router.get("/files", function (req, res, next) {
        dirpop = dir;
        fs.readdir(dir, function (err, files) {
            var fileObj,
                filesArr = [];
            files.forEach(function (file) {
                fileObj = {
                    name: file,
                    path: "/files/" + file,
                    time: fs.lstatSync(path.join(dir, file)).mtime.toLocaleString(),
                    isDir: fs.lstatSync(path.join(dir, file)).isDirectory(),
                    icon: getFileIcon(path.extname(file)),
                    size: Math.round(fs.lstatSync(path.join(dir, file)).size / (1024 )).toString() + " KB"
                };
                if (fileObj.isDir) {
                    fileObj.size = " "
                }
                filesArr.push(fileObj)

            });
            if (err) throw err
            var obj = {
                files: filesArr,
                isDir: fs.lstatSync(dir).isDirectory(),
                path: "/",
                time: fs.lstatSync(dir).mtime.toLocaleString(),
                type: "dir"
            };
            return res.json(obj)
        })
    });

    router.post('/archive', function (req, res) {

        var archive = archiver('zip', {
            zlib: {level: 9}
        });
        var s = req.body.selected;
        var filess = s.split(',');
      //  console.log("leng: "+filess.length);
        if(filess.length >1) {
            filess.forEach(function (eachfile) {

                var reqDirPath = path.join(dirpop, eachfile);
             //   console.log("DIR: "+reqDirPath)

                if (fs.lstatSync(reqDirPath).isDirectory()) {
                    archive.directory(reqDirPath)
                } else {
               //     console.log("File: " + reqDirPath);
                    archive.file(reqDirPath);
                }

            });
            res.setHeader("Content-Type", "application/zip");
            res.setHeader('Content-disposition', 'attachment; filename=downlaod.zip');
            archive.pipe(res);
            archive.finalize();
        } else {
            var reqDirPath = path.join(dirpop, filess[0]);
           // console.log("DIR: "+reqDirPath)

            if (fs.lstatSync(reqDirPath).isDirectory()) {
                archive.directory(reqDirPath)
                res.setHeader("Content-Type", "application/zip");
                res.setHeader('Content-disposition', 'attachment; filename=downlaod.zip');
                archive.pipe(res);
                archive.finalize();
            } else {
                var reqDirPath = path.join(dirpop, filess[0]);
             ///   console.log("DIr: "+__dirname)
                res.download(reqDirPath);

            }
        }

    });

    router.post('/upload', function (req, res) {

     //   console.log("dirpop: " + dirpop)
        var form = new formidable.IncomingForm();
        form.uploadDir = dirpop;
        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            res.redirect('/');
        });
        form.on('file', function (field, file) {
            fs.rename(file.path, form.uploadDir + "/" + file.name);
        });
    });
    app.use('/', router);
};
function getFileIcon(ext) {
    return ( ext && extensionsMap[ext.toLowerCase()]) || 'fa-file-o';
}
var extensionsMap = {
    ".zip": "fa-file-archive-o",
    ".gz": "fa-file-archive-o",
    ".bz2": "fa-file-archive-o",
    ".xz": "fa-file-archive-o",
    ".rar": "fa-file-archive-o",
    ".tar": "fa-file-archive-o",
    ".tgz": "fa-file-archive-o",
    ".tbz2": "fa-file-archive-o",
    ".z": "fa-file-archive-o",
    ".7z": "fa-file-archive-o",
    ".mp3": "fa-file-audio-o",
    ".cs": "fa-file-code-o",
    ".c++": "fa-file-code-o",
    ".cpp": "fa-file-code-o",
    ".js": "fa-file-code-o",
    ".xls": "fa-file-excel-o",
    ".xlsx": "fa-file-excel-o",
    ".png": "fa-file-image-o",
    ".jpg": "fa-file-image-o",
    ".jpeg": "fa-file-image-o",
    ".gif": "fa-file-image-o",
    ".mpeg": "fa-file-movie-o",
    ".pdf": "fa-file-pdf-o",
    ".ppt": "fa-file-powerpoint-o",
    ".pptx": "fa-file-powerpoint-o",
    ".txt": "fa-file-text-o",
    ".log": "fa-file-text-o",
    ".doc": "fa-file-word-o",
    ".docx": "fa-file-word-o"
};



