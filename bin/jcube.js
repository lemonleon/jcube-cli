#!/usr/bin/env node

const program = require('commander');

program
    .version('0.1.0')
    .command('init <dependence> [project-name]', 'generate a new project with dependence')
    .command('queryCDN [url]', 'query url last modified')
    .parse(process.argv);
