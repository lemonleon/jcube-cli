#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const checkVersion = require('../lib/check-version');
const generate = require('../lib/generate');

program
  .usage('<dependence> [project-name]')
  .description('create a new project');
  //.parse(process.argv);


/**
 * Help
 */
program.on('--help', function () {
  console.log('  Examples:');
  console.log();
  console.log('    # create a new project');
  console.log('    $ jcube init my-project');
  console.log()

});

function help () {
  program.parse(process.argv);
  if (program.args.length < 1) return program.help()
}
help();


/**
 * Settings
 */
var dependence = program.args[0];
var projectName = program.args[1];
var to = path.resolve(projectName || '.');
var template = path.resolve(__dirname, '../templates', dependence);



if(fs.existsSync(to)){
    inquirer.prompt([{
        type: 'confirm',
        message: 'Target directory exists. Continue?',
        name: 'ok',
        default: 'y'
    }]).then(function (answers){
        if(answers.ok){
            run();
        }
    });
}
else{
    run();
}

function run(){
    checkVersion(function (){
        generate(template, to, function (err){
            if(!err)
                console.log(chalk.green('      Generated ' + projectName + '!'));
                console.log(chalk.green('      Happy coding!'));
        });
    })
}
