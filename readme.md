# jcube-cli

[![npm](https://img.shields.io/badge/npm-0.3.3-orange.svg)](https://www.npmjs.com/package/jcube-cli)
[![node](https://img.shields.io/badge/node-%3E%3D4.0.0-blue.svg)](https://nodejs.org/en/)

Jcube-cli is a simple set of scaffolding that supports Vue、React、ordinary projects.

## Table of Contents

- [Install](#install)

- [Usage](#usage)

- [Command reference](#command-reference)

### Install

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred) and [Git](https://git-scm.com/).
```bash
    npm install -g jcube-cli
```

### Usage
```bash
    jcube init <dependence-type> [project-name] [options]
```
 
Example:

``` bash
    jcube init react my-project
```

Project structure:

``` javascript
    |-jcube_app_pc    //product line
        |-develop    //development
            |-my-project    //project
            ...
        |-release    //production
            |-my-project    //project
            ...
```

workflow:

- `npm run dev`:  start programming.
- `npm run build`: building project.
- `npm run release`: release production code, they will be pushed to the corresponding release directory.

### Command reference

All commands can be searched by `jcube --help`

#### jcube init  dependence-type  [project-name] [options]

Generated project with dependence.

dependence-type:

 - react
 - <s>vue</s>:  coming soon
 - <s>normal</s>: coming soon
 
Available options:
 - -v: create a directory of version

#### jcube queryCDN [url]
check the last-modified of static resource to determine whether that's right.

`jcube queryCDN`: every time run `npm run release`could be generated a file that needs to be updated, distinguish the results in two colors.
 - green: static resource has been updated.
 - red: nothing new has been updated.
 
`jcube queryCDN [url]`: run this command to check single resource.

