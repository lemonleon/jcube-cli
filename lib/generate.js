const path = require('path');
const Metalsmith = require('metalsmith');
const render = require('consolidate').handlebars.render;
const async = require('async');
const inquirer = require('inquirer');
const semver = require('semver');

var currentPath = path.resolve('.');
var production = (/(\w+)_(\w+)_(\w+)\\$/gmi.exec(currentPath.substring(0, currentPath.indexOf('develop'))))[2];
var releasePath = currentPath.substring(currentPath.indexOf('develop')+8);

module.exports = function (src, dest, projectVersion, done){
    var metalsmith = Metalsmith(src);
    var projectRelativePath = production+'/'+dest.substring(dest.indexOf(releasePath)).replace(/\\/g, '/');
    var questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'project name',
            default: 'my-project'
        },
        // {
        //     type: 'input',
        //     message: 'version',
        //     name: 'projectVersion',
        //     default: '1.0.0',
        //     validate: function (value){

        //         if(semver.valid(value)){
        //             return true;
        //         }

        //         return 'Please enter a vaild version like this: 1.0.0';
        //     }
        // },
        {
            type: 'input',
            message: 'release path',
            name: 'releasePath',
            default: projectRelativePath
        }
    ];
    var version = projectVersion || '1.0.0';
    
    metalsmith
        .source('.')
        .destination(dest)
        .use(askQuestions(createQuestions(questions), version))
        .use(renderTemplate())
        .clean(false)
        .build(function (err){
            if(err)
                console.log(err);

            done(err);
        })
};

function askQuestions(prompts, projectVersion){
    return function (files, metalsmith, done){
        ask(prompts, metalsmith.metadata(), projectVersion, done);
    }
}

function ask(prompts, data, projectVersion, done){
    async.eachSeries(Object.keys(prompts), function (key, next){
        prompt(data, key, prompts[key], projectVersion, next);
    }, done);
}

function prompt(data, key, prompt, projectVersion, done){
    var promptDefault = prompt.default;
    if (typeof prompt.default === 'function') {
        promptDefault = function () {
            return prompt.default.bind(this)(data);
        }
    }

    inquirer.prompt([prompt]).then(function (answers){
        data[key] = answers[key];
        data.projectVersion = projectVersion;
        done();
    });
}

function createQuestions(quesArr){
    var result = {};

    quesArr.forEach(function (item, index){
        result[item.name] = item;
    });

    return result;
}

function renderTemplate(){
    return function (files, metalsmith, done){
        var keys = Object.keys(files);

        async.each(keys, function (file, next){
            var str = files[file].contents.toString();
            var metalsmithMetadata = metalsmith.metadata();

            if (!/{{([^{}]+)}}/g.test(str)) {
                return next()
            }

            render(str, metalsmithMetadata, function(err, res){
                if(err) return next(err);

                files[file].contents = new Buffer(res);
                next();
            });
        }, done);
    }
}