const semver = require('semver');
const chalk = require('chalk');
const packageConfig = require('../../package.json');
const exec = (cmd) => require('child_process').execSync(cmd).toString().trim();
// const exec = function (cmd){
//     return require('child_process').execSync(cmd).toString().trim();
// };

const versionRequirements = [
    {
        name: 'node',
        currentVersion: exec('node --version'),
        versionRequirement: packageConfig.engines.node
    },
    {
        name: 'npm',
        currentVersion: exec('npm --version'),
        versionRequirement: packageConfig.engines.npm
    }
];

module.exports = function (){
    var warnings = [];

    for(var i = 0; i < versionRequirements.length; i++){
        var mod = versionRequirements[i];
        if(!semver.satisfies(mod.currentVersion, mod.versionRequirement)){
            warnings.push(
                `${mod.name} : ${chalk.red(mod.currentVersion)} should be ${chalk.green(mod.versionRequirement)}`
            )
        }
    }

    if(warnings.length){
        console.log('');
        console.log(chalk.yellow('To use this template, you must update following to modules:'));
        console.log('');
        for(var j = 0; j < warnings.length; j++){
            var waring = warnings[j];
            console.log('   '+waring);
        }
        console.log('');
        process.exit(1);
    }
};