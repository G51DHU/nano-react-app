#!/usr/bin/env node
import chalk from 'chalk'
import ora from "ora"
import yargs from "yargs"
import {hideBin} from "yargs/helpers"
import gitClone from "download-git-repo"
import readline from 'readline'
import {execSync} from 'child_process'
import validateProjectName from "validate-npm-package-name"
import {packageInstall, packageDownloadFail} from "./funcs.js"

yargs(hideBin(process.argv))
    .usage("")
    .usage("Usage: nano-react-app               \n   - Starts nano-react-app tool")
    .usage("Usage: nano-react-app init          \n   - Downloads nano-react-app template in current directory.")
    .usage("Usage: nano-react-app <project-name>\n   - Creates directory using name given then, downloads nano-react-app template in that directory.")
    .argv;

const args = process.argv.slice(2)
const working_dir_path = process.cwd()
const current_dir = working_dir_path.split("/").slice(-1)[0]
const template_github_link = "g51dhu/nano-react-app-template-js"
const package_managers = [ "pnpm", "yarn", "npm"]

const spinner_download = ora("Downloading")
const spinner_install = ora("Installing packages.")
spinner_download.indent = 6
spinner_install.indent = 6
var existing_package_managers = []

//Regex check against package manager versions to see if they exist.
//Should work on any OS, hopefully.
for (const index in package_managers){
    try{
        const existenceCheck = execSync(`${package_managers[index]} -v`, { encoding: 'utf-8' })
        if (existenceCheck.match(/[0-9]+.[0-9]+.[0-9]+/g)){
            existing_package_managers.push(package_managers[index])
            break
        }
    }
    catch{
    }
}


console.log("\n   "+chalk.bgMagenta("       NANO REACT APP       ")+"   ");
console.log("-----------------------------------")


if (args[0] === "init"){
    console.log("      - Name : ", current_dir)
    const validationAnswer = validateProjectName(current_dir[0])

    if (validationAnswer["validForNewPackages"] === true){
        console.log("-----------------------------------")
        spinner_download.start()
        gitClone(template_github_link, working_dir_path, function (err) {
            err ? packageDownloadFail(spinner_download) : packageInstall(working_dir_path, current_dir, existing_package_managers, spinner_download, spinner_install)
        })
    }
    else if (validationAnswer["validForNewPackages"] === false){
        console.log(chalk.bgMagenta("Errors"),[validationAnswer["errors"], validationAnswer["warnings"]].filter(e => e !== undefined))
    }
}

else if(args.length > 0 ){
    console.log("      - Name : ",args[0])
    const validationAnswer = validateProjectName(args[0])

    if (validationAnswer["validForNewPackages"] === true){
        console.log("-----------------------------------")
        spinner_download.start()
        gitClone(template_github_link, `${working_dir_path}/${args[0]}`, function (err) {
            err ? packageDownloadFail(spinner_download) : packageInstall(`${working_dir_path}/${args[0]}`, args[0],  existing_package_managers, spinner_download, spinner_install)
        })
    }
    else if (validationAnswer["validForNewPackages"] === false){
        console.log(chalk.bgMagenta("Errors"),[validationAnswer["errors"], validationAnswer["warnings"]].filter(e => e !== undefined))
    }
}

else {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    
    rl.question('      - Name? : ', function (project_name) {
        rl.question('      - Description? : ', function (package_description) {
            rl.question('      - Keywords? : ', function (package_keywords) {
                
                package_keywords = package_keywords.split(/\s*[,*]\s*/g)
                const validationAnswer = validateProjectName(project_name)

                if (validationAnswer["validForNewPackages"] === true){
                    console.log("-----------------------------------")
                    spinner_download.start()
                    gitClone(template_github_link, `${working_dir_path}/${project_name}`, function (err) {
                        err ? packageDownloadFail(spinner_download) : packageInstall(path =`${working_dir_path}/${project_name}`, project_name , existing_package_managers, spinner_download, spinner_install, package_description)
                    })

                }
                else if (validationAnswer["validForNewPackages"] === false){
                    console.log(
                        chalk.bgMagenta("Errors"),
                        [validationAnswer["errors"], validationAnswer["warnings"]].filter(e => e !== undefined)
                    )
                    rl.close()
                }

            });
        });
    });

    rl.on('close', function () {
        console.log(`\n------------${chalk.red("Cancelled")}--------------`)
        process.exit(0);
      });
}