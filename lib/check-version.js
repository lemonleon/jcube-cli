const request = require('request');
const semver = require('semver');
const chalk = require('chalk');

const packageConfig = require('../package.json');

module.exports = function (done){
    if(!semver.satisfies(process.version, packageConfig.engines.node)){
        return console.log(chalk.red(
            '  You must upgrade node to ' + packageConfig.engines.node + ' to use jcube'
        ));
    }

    request({
        url: 'https://registry.npmjs.org/jcube',
        timeout: 1000
    }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
            var latestVersion = JSON.parse(body)['dist-tags'].latest
            var localVersion = packageConfig.version
            if (semver.lt(localVersion, latestVersion)) {
                console.log(chalk.yellow('  A newer version of jcube is available.'))
                console.log()
                console.log('  latest:    ' + chalk.green(latestVersion))
                console.log('  installed: ' + chalk.red(localVersion))
                console.log()
            }
        }
        done();
    })
}