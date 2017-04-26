require('shelljs/global');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');

var getFiles = require('../utils/getFiles');
var getHash = require('../utils/getHash');
var config = require('./settings/config');
var publicPath = config.prod.publicPath;
var buildFileList = getFiles('./build/');
var queryNum = 0;
var buildHash = {};
var releaseFiles = [];
var releasePath = pwd().replace(/develop/, 'release');

function run(gen){
    var g = gen();

    function next(data){
        var result = g.next(data);
        if (result.done) return result.value;
        result.value.then(function(data){
            next(data);
        });
    }

    next();
}
//同步查询hash
function queryHash(path){
    return new Promise(function (resolve, reject){
        getHash(path, function (hash){
            resolve({hash: hash, num: queryNum++});
        });
    });
}
//生成hash表
buildFileList.forEach(function (item, index){
    function* gen(){
        var result = yield queryHash(item.filePath);

        buildHash[item.filePath] = {
            hash: result.hash,
            lastModify: item.lastModify
        };
        //already hash
        if(queryNum == buildFileList.length){
            queryNum = 0;
            var isExists = fs.existsSync('./\.jcube/hash');
            
            if(isExists){   //hot
                hotBuild(buildHash, function (diff){
                    if(diff.length){
                        //console.log(diff);
                        diff.forEach(function (item, index){
                            releaseFiles.push('http:'+publicPath+item.file);
                            console.log(`     ${chalk.magenta('----------------------')}  ${chalk.red(index+1)}  ${chalk.magenta('----------------------')}`);
                            console.log(`     ${chalk.yellow('  filename:   ')} ${chalk.green(item.file)}`);
                            console.log(`     ${chalk.yellow('beforeHash:   ')} ${chalk.green(item.beforeHash)}`);
                            console.log(`     ${chalk.yellow('  afterHsh:   ')} ${chalk.green(item.afterHsh)}`);
                            console.log(`     ${chalk.yellow('lastModify:   ')} ${chalk.green(item.lastModify)}`);
                        });
                        
                        console.log(' ');
                        console.log(`     ${chalk.cyan(`update files: ${diff.length}`)}  ${chalk.white('>>')}  ${chalk.cyan(`uptate time: ${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}`)}`);
                        console.log(' ');
                        //create release update files
                        createReleaseUpdateFiles(releaseFiles);
                    }
                    else{
                        console.log(' ');
                        console.log(chalk.red('     No files to update!'));
                    }
                    
                });
            }
            else{   //first
                firstBuild(buildHash);
            }
        }
    }
    run(gen);
});
/**
 * Load file.
 */
function loadFile(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf-8');
}
/**
 * write file.
 */
function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
}
/**
 * first build
 */
function firstBuild(buildHash){
    mkdir('./\.jcube/hash');
    var ws = fs.createWriteStream('./\.jcube/hash/build-hash.json');
    ws.write(JSON.stringify(buildHash));
    ws.end();
    
    ws.on('finish',function(){
        cp('./\.jcube/hash/build-hash.json', './\.jcube/hash/release-hash.json');
    });
    //push to release dir
    mkdir('-p', releasePath)  //https://github.com/shelljs/shelljs/issues/705
    cp('-r', './build/js', releasePath);
    cp('-r', './build/dll', releasePath);
    cp('-r', './build/css', releasePath);

    //write release files info
    var count = 0;
    var releaseFiles = {};
    var releaseFilesArr = [];
    var releaseTime = Date.now();
    mkdir('./\.jcube/release');
    ls('-R',releasePath).forEach(function(file, index) {
        var stat = fs.statSync(path.normalize(releasePath+'\\'+file));
        
        if(stat.isFile()){
            count++;
            releaseFiles[file] = releaseTime;
            releaseFilesArr.push('http:'+publicPath+file);
            console.log(`     ${chalk.magenta('----------------------')}  ${chalk.red(count)}  ${chalk.magenta('----------------------')}`);
            console.log(`     ${chalk.yellow('  filename:   ')} ${chalk.green(file)}`);
            console.log(`     ${chalk.yellow('      hash:   ')} ${chalk.green(buildHash['./build/'+file].hash)}`);
            console.log(`     ${chalk.yellow('lastModify:   ')} ${chalk.green(buildHash['./build/'+file].lastModify)}`);
            
        }
    });
    createReleaseFiles(releaseFiles, releaseFilesArr);
    console.log(' ');
    console.log(`     ${chalk.cyan(`update files: ${count}`)}  ${chalk.white('>>')}  ${chalk.cyan(`uptate time: ${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}`)}`);
    console.log(' ');
}

/**
 * HOT build
 */
function hotBuild(buildHash, cb){
    var diff = [];
    // 1. get release hash
    var releaseHashRs = fs.createReadStream('./\.jcube/hash/release-hash.json'),
        releaseHashArr = [];

    releaseHashRs.on('data', function (chuck){
        releaseHashArr.push(chuck);
    });

    releaseHashRs.on('end', function (chuck){
        var buffer = Buffer.concat(releaseHashArr);
        var releaseHash = JSON.parse(buffer.toString());
        var releaseUpdate = [];
        
        //2. diff
        for(var file in buildHash){
            if(isReleaseFile(file) && releaseHash[file].hash !== buildHash[file].hash){
                var target = file.replace(/\.\/build\//gi, '');

                diff.push({
                    file: target,
                    beforeHash: releaseHash[file].hash,
                    afterHsh: buildHash[file].hash,
                    lastModify: buildHash[file].lastModify
                });
                //update releaseHash
                releaseHash[file].hash = buildHash[file].hash;
                releaseHash[file].lastModify = buildHash[file].lastModify;
                //update files
                cp(file, path.normalize(releasePath+'\\'+target));
            }
        }
        //write to release hash
        write('./\.jcube/hash/release-hash.json', JSON.stringify(releaseHash));
        
        cb && cb(diff);
    });
}
/**
 * create release files (first)
 */
function createReleaseFiles(files, filesArr){
    var json = {};
    var filesStr = filesArr.join('\n');

    json.mtime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    json.files = files;

    write('./\.jcube/release/releaseFiles.base.json', JSON.stringify(json, null, 2));
    write('./\.jcube/release/releaseFiles.update.txt', filesStr);
}
/**
 * create release update files (hot)
 */
function createReleaseUpdateFiles(files){
    var filesStr = files.join('\n');

    write('./\.jcube/release/releaseFiles.update.txt', filesStr);
}
/**
 * release rule
 * @param {string} _path 
 */
function isReleaseFile(_path){
    var extJson = {
        ".html": false,
        ".json": false,
        ".doc": false,
        ".md": false,
        ".doc": false,
        ".docx": false,
        ".rb": false,
        ".scss": false,
        ".js": true,
        ".css": true,
        ".jpg": true,
        ".png": true,
        ".jpeg": true,
        ".gif": true,
        ".svg": true,
        ".mp3": true,
        ".mp4": true
    };
    return extJson[path.extname(_path)];
}