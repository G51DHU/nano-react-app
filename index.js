#!/usr/bin/env node
import chalk from 'chalk'
import ora from "ora"
import yargs from "yargs"
import {hideBin} from "yargs/helpers"
import gitClone from "download-git-repo"
import readline from 'readline'
import {execSync, exec} from 'child_process'
import validateProjectName from "validate-npm-package-name"

yargs(hideBin(process.argv))
    .usage("")
    .usage("Usage: nano-preact-app               \n   - Starts nano-preact-app tool")
    .usage("Usage: nano-preact-app init          \n   - Downloads nano-preact-app template in current directory.")
    .usage("Usage: nano-preact-app <project-name>\n   - Creates directory using name given then, downloads nano-preact-app template in that directory.")
    .argv;

const args = process.argv.slice(2)
const working_dir_path = process.cwd()
const current_dir = working_dir_path.split("/").slice(-1)[0]
const template_github_link = "g51dhu/nano-preact-app-template-js"
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

console.log("\n   "+chalk.bgMagenta("       NANO PREACT APP       ")+"   ");
console.log("-----------------------------------")

// need to pass "spinner_download" instance along, 
// otherwise it dosent stop the spinner and causes error.
function packageInstall(path, spinner_download){
    spinner_download.succeed("Download Success.") 
    spinner_install.start()
    exec(`cd ${path} && ${existing_package_managers[0]} i`, ()=>{spinner_install.succeed("Packages installed."); console.log("-----------------------------------")})
}

function packageInstallFail(){
    spinner_download.fail('Template download error.')
}

if (args[0] === "init"){
    console.log("      - Name : ", current_dir)
    const validationAnswer = validateProjectName(current_dir[0])

    if (validationAnswer["validForNewPackages"] === true){
        console.log("-----------------------------------")
        spinner_download.start()
        gitClone(template_github_link, working_dir_path, function (err) {
            err ? packageInstallFail() : packageInstall(working_dir_path, spinner_download)
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
            err ? packageInstallFail() : packageInstall(`${working_dir_path}"/"${args[0]}`, spinner_download)
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
    
    rl.question('      - Name? : ', function (package_name) {
        rl.question('      - Description? : ', function (package_description) {
            rl.question('      - Keywords? : ', function (package_keywords) {
                
                package_keywords = package_keywords.split(/\s*[,*]\s*/g)
                const validationAnswer = validateProjectName(package_name)

                if (validationAnswer["validForNewPackages"] === true){
                    console.log("-----------------------------------")

                    spinner_download.start()
                    gitClone(template_github_link, `${working_dir_path}/${package_name}`, function (err) {
                        err ? packageInstallFail() : packageInstall(`${working_dir_path}"/"${package_name}`, spinner_download)
                    })

                }
                else if (validationAnswer["validForNewPackages"] === false){
                    console.log(chalk.bgMagenta("Errors"),[validationAnswer["errors"], validationAnswer["warnings"]].filter(e => e !== undefined))
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