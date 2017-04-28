#!/usr/bin/env node

const program = require('commander');

program
    .version(require('../package.json').version)
    .command('init <dependence> [project-name] [options]', 'generate a new project with dependence')
    .command('queryCDN [url]', 'query url last modified')
    .parse(process.argv);
