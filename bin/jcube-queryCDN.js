#!/usr/bin/env node

const program = require('commander');
const request = require('request');
const moment = require('moment');
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

var files = program.args[0] || JSON.parse(loadFile(path.resolve('./hashMap/releaseFiles.json'))).files;

queryCDN(files);

function loadFile(name) {
    return fs.readFileSync(name, 'utf-8');
}

function queryCDN(file) {
    if(typeof file == "string"){
        request({url: 'http://static.360buyimg.com/finance/'+file}, function (err, res){
            if(err) throw err;
            if(res.statusCode !== 200){
                console.log(file+': '+res.statusMessage);
            }
            else{
                var oDate = new Date(res.headers['last-modified']);
                console.log(file+'   >>   '+moment(oDate.getTime()).format('YYYY-MM-DD HH:mm:ss'));
            }
        })
    }
    else{
        file.forEach(function (item, index){
            request({url: 'http://static.360buyimg.com/finance/'+item}, function (err, res){
                if(err) throw err;
                if(res.statusCode !== 200){
                    console.log(file+': '+res.statusMessage);
                }
                else{
                    var oDate = new Date(res.headers['last-modified']);
                    console.log(item+'   >>   '+moment(oDate.getTime()).format('YYYY-MM-DD HH:mm:ss'));
                }
            })
        });
    }
}
