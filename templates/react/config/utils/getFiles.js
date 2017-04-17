const fs = require('fs');
const path = require('path');
const moment = require('moment');


function readFile(filePath, arr){
    var files = fs.readdirSync(filePath);
    
    files.forEach(function (item, index){
        var stat = fs.statSync(filePath+item);
        
        if(stat.isDirectory()){
            readFile(filePath+item+'/', arr);
        }
        else{
            var obj = {};
            var oDate = new Date(stat.ctime);

            obj.path = filePath;
            obj.filename = item;
            obj.filePath = filePath+item;
            obj.fullPath = path.resolve(filePath, item);
            obj.lastModify = moment(oDate).format('YYYY-MM-DD HH:mm:ss');
            arr.push(obj);
        }
    });
}

function getFiles(path){
    var fileList = [];

    readFile(path, fileList);

    return fileList;
}

module.exports = getFiles;