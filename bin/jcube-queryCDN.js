#!/usr/bin/env node

const program = require('commander');
const request = require('request');
const moment = require('moment');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

program
    .usage('[url]')
    .description('query url last modified')
    .parse(process.argv);

/**
 * Help
 */
program.on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log('    # query url last modified');
    console.log('    $ jcube queryCDN [url]');
    console.log()
});

var currentPath = path.resolve('.');
var baseFile = JSON.parse(loadFile(path.resolve('./\.jcube/release/releaseFiles.base.json')));
var hotFile = loadFile(path.resolve('./\.jcube/release/releaseFiles.update.txt')).split('\n');
var files = program.args[0] || hotFile;
var queryNum = 0;
var production = (/(\w+)_(\w+)_(\w+)\\$/gmi.exec(currentPath.substring(0, currentPath.indexOf('develop'))))[2];
var releasePath = currentPath.substring(currentPath.indexOf('develop')+8).replace(/\\/g, '/');

queryCDN(files);

function loadFile(name) {
    return fs.readFileSync(name, 'utf-8');
}

function queryCDN(file) {
    if(typeof file == "string"){
        updateSingle(file);
    }
    else{
        updateFiles(file);
    }
}

function updateSingle(url){
    var str = formatURL(url);

    request({url: url}, function (err, res){
        if(err) throw err;
        if(res.statusCode !== 200){
            console.log(' ');
            console.log(file+': '+res.statusMessage);
        }
        else{
            var oDate = new Date(res.headers['last-modified']);

            console.log(' ');
            console.log(chalk.yellow(str+'   >>   '+moment(oDate.getTime()).format('YYYY-MM-DD HH:mm:ss')));
        }
    })
    
}

function updateFiles(arr){
    var updateNum = 0;   
    console.log(' ');
    
    arr.forEach(function (item, index){
        function *gen(){
            var result = yield queryURL(item);
            var projectPath = getProjectPath(item);
            
            if(result.err) throw result.err;
            if(result.statusCode !== 200){
                console.log(formatURL(item)+': '+result.statusMessage);
            }
            else{
                var oDate = new Date(result.headers['last-modified']);
                
                if(!baseFile.files[projectPath] || oDate.getTime() > baseFile.files[projectPath]){   //success
                    baseFile.files[projectPath] = oDate.getTime();
                    baseFile.mtime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    updateNum++;
                    console.log(chalk.green('      '+moment(oDate.getTime()).format('YYYY-MM-DD HH:mm:ss')+'   >>   '+projectPath));
                }
                else{
                    console.log(chalk.red('      '+moment(oDate.getTime()).format('YYYY-MM-DD HH:mm:ss')+'   >>   '+projectPath));
                }
                if(queryNum == arr.length && updateNum){
                    write('./\.jcube/release/releaseFiles.base.json', JSON.stringify(baseFile, null, 2));
                }
            }
        }

        run(gen);
    });
}

function queryURL(url){
    return new Promise(function (resolve, reject){
        request({url: url}, function (err, res){
            resolve({
                err: err,
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers,
                num: queryNum++
            });
        })
    });
}

/**
 * write file.
 */
function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
}

function getProjectPath(url) {
    // +1: replace last '/'
    return url.substring(url.indexOf(releasePath)+releasePath.length+1).replace(/(\r|\n)$/, '');
}

function formatURL(url){
    return url.replace(/(http|https)\:\/\/static\.360buyimg\.com\/finance\//, '');
}

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