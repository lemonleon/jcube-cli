const fs = require('fs');
const crypto = require('crypto');

function getHash(path, callback){
    var obj = crypto.createHash('md5');
    var stream = fs.createReadStream(path);

    var resultArr = [];

    stream.on('data', function (chunk){
        resultArr.push(chunk);
        //obj.update(chunk);
    });

    stream.on('end', function(){
        var buffer = Buffer.concat(resultArr);
        obj.update(buffer.toString());
        callback(obj.digest('hex'));
    });
}

// getHash('./build/js/app.js', function(hash){
//     console.log(hash);
// })

module.exports = getHash;