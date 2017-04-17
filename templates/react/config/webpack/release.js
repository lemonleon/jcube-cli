require('shelljs/global');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');

var getFiles = require('../utils/getFiles');
var getHash = require('../utils/getHash');

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

var buildFileList = getFiles('./build/');
var queryNum = 0;
var buildHash = {};
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
        //全部文件hash已生成
        if(queryNum == buildFileList.length){
            queryNum = 0;
            var isExists = fs.existsSync('./hashMap');
            
            //console.log(isExists);
            //console.log(buildHash);
            if(isExists){   //后续更新
                hotBuild(buildHash, function (diff){
                    if(diff.length){
                        console.log(' ');
                        console.log(`     ${chalk.cyan(`update files: ${diff.length}`)}  ${chalk.white('>>')}  ${chalk.cyan(`uptate time: ${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}`)}`);
                        console.log(' ');
                        diff.forEach(function (item, index){
                            console.log(`     ${chalk.magenta('----------------------')}  ${chalk.red(index+1)}  ${chalk.magenta('----------------------')}`);
                            console.log(`     ${chalk.yellow('filename:   ')} ${chalk.green(item.file)}`);
                            console.log(`     ${chalk.yellow('beforeHash: ')} ${chalk.green(item.beforeHash)}`);
                            console.log(`     ${chalk.yellow('afterHsh:   ')} ${chalk.green(item.afterHsh)}`);
                            console.log(`     ${chalk.yellow('lastModify: ')} ${chalk.green(item.lastModify)}`);
                        });
                    }
                    else{
                        console.log(' ');
                        console.log(chalk.red('     No files to update!'));
                    }
                    
                });
            }
            else{   //第一次更新
                firstBuild(buildHash);
            }
        }
    }
    run(gen);
});

//1. 生成build目录下的hash表
//2. 跟release下的hash表进行对比
//3. 复制并替换差异文件到release目录下


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
    mkdir('./hashMap');
    var ws = fs.createWriteStream('./hashMap/build-manifest.json');
    ws.write(JSON.stringify(buildHash));
    ws.end();

    ws.on('finish',function(){
        cp('./hashMap/build-manifest.json', './hashMap/release-manifest.json');
    });
    //复制静态资源到release目录下
    cp('-R', './build/css/', './testRelease/');
    cp('-R', './build/js/', './testRelease/');
    
}

/**
 * HOT build
 */
function hotBuild(buildHash, cb){
    var diff = [];
    // 1. 读取release的hash表
    var releaseHashRs = fs.createReadStream('./hashMap/release-manifest.json'),
        releaseHashArr = [];

    releaseHashRs.on('data', function (chuck){
        releaseHashArr.push(chuck);
    });

    releaseHashRs.on('end', function (chuck){
        var buffer = Buffer.concat(releaseHashArr);
        var releaseHash = JSON.parse(buffer.toString());
        
        //2. 以buildHash为准进行对比
        for(var file in buildHash){
            //diff.push(buildHash[file].hash);
            if(releaseHash[file].hash !== buildHash[file].hash){
                diff.push({
                    file: file,
                    beforeHash: releaseHash[file].hash,
                    afterHsh: buildHash[file].hash,
                    lastModify: buildHash[file].lastModify
                });
                //更新releaseHash
                //console.log(`releaseHash: ${releaseHash[file].hash} --- buildHash: ${buildHash[file].hash}`);
                releaseHash[file].hash = buildHash[file].hash;
                releaseHash[file].lastModify = buildHash[file].lastModify;
                //更新变化的文件
                var target = file.replace(/\.\/build\//gi, '');
                //console.log(file, target);
                cp(file, './testRelease/'+target);
            }
        }
        //写入releaseHash表
        //console.log(releaseHash);
        write('hashMap/release-manifest.json', JSON.stringify(releaseHash));
        //console.log(diff);
        cb && cb(diff);
    });
}