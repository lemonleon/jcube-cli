const Metalsmith = require('metalsmith');
const render = require('consolidate').handlebars.render;
const async = require('async');
const inquirer = require('inquirer');
const semver = require('semver')

module.exports = function (src, dest, done){
    var metalsmith = Metalsmith(src);
    var questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'enter project name',
            default: 'my-project'
        },
        {
            type: 'input',
            message: 'enter version',
            name: 'projectVersion',
            default: '1.0.0',
            validate: function (value){
                
                if(semver.valid(value)){
                    return true;
                }

                return 'Please enter a vaild version like this: 1.0.0';
            }
        }
    ];

    metalsmith
        .source('.')
        .destination(dest)
        .use(askQuestions(createQuestions(questions)))
        .use(renderTemplate())
        .clean(false)
        .build(function (err){
            if(err) 
                console.log(err);

            done(err);
        })

}

function askQuestions(prompts){
    return function (files, metalsmith, done){
        ask(prompts, metalsmith.metadata(), done);
    }
}

function ask(prompts, data, done){
    async.eachSeries(Object.keys(prompts), function (key, next){
        prompt(data, key, prompts[key], next);
    }, done);
}

function prompt(data, key, prompt, done){
    var promptDefault = prompt.default
    if (typeof prompt.default === 'function') {
        promptDefault = function () {
            return prompt.default.bind(this)(data);
        }
    }

    inquirer.prompt([prompt]).then(function (answers){
        data[key] = answers[key];
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
                if(err) return next(err)

                files[file].contents = new Buffer(res);
                next();
            });
        }, done);
    }
};