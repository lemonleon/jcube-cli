var getFiles = require('./getFiles');
var getHash = require('./getHash');

var fileList = getFiles('./build/');
var hashObj = {};

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

var queryNum = 0;

//同步查询hash
function queryHash(path){
    return new Promise(function (resolve, reject){
        getHash(path, function (hash){
            resolve({hash: hash, num: queryNum++});
        });
    });
}

console.log(fileList);

fileList.forEach(function (item, index){
    function* gen(){
        var result = yield queryHash(item.filePath);

        hashObj[item.filePath] = {
            hash: result.hash,
            lastModify: item.lastModify
        };
        
        if(queryNum == fileList.length){
            //console.log(hashObj);
        }
    }
    run(gen);
});
