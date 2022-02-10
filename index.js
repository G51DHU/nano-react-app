#!/usr/bin/env node
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import gitClone from 'download-git-repo'
import readline from 'readline'
import validateProjectName from 'validate-npm-package-name'
import {
  selectPackageManager,
  packageInstall,
  useGivenPkgMnger
} from './funcs.js'

console.log('\n   ' + chalk.bgMagenta('       NANO REACT APP       ') + '   ')
console.log('-----------------------------------')

const argv = yargs(hideBin(process.argv))
  .usage('')
  .usage('Usage:\n  nano-react-app               \n  - Start nano-react-app tool.')
  .usage('Usage:\n  nano-react-app init          \n  - Set up in current directory.')
  .usage('Usage:\n  nano-react-app <project-name>\n  - Set up in directory with given name.')
  .option('package-manager', { alias: 'pm', type: 'string', description: 'Choose the package manager.' })
  .argv

const args = process.argv.slice(2)
const working_dir_path = process.cwd()
const current_dir = working_dir_path.split('/').slice(-1)[0]
const template_github_link = 'g51dhu/nano-react-app-template-js'
const chosen_package_manager = (argv['package-manager'] === undefined) ? selectPackageManager() : useGivenPkgMnger(argv['package-manager'])
console.log(chosen_package_manager)
const spinner_download = ora('Downloading')
const spinner_install = ora('Installing packages.')
spinner_download.indent = 6
spinner_install.indent = 6

if (args[0] === 'init') {
  console.log('      - Name : ', current_dir)
  const validation_answer = validateProjectName(current_dir[0])

  if (validation_answer.validForNewPackages === true) {
    console.log('-----------------------------------')
    spinner_download.start()
    gitClone(template_github_link, working_dir_path, function (err) {
      err ? spinner_download.fail('Template download error.') : packageInstall(working_dir_path, current_dir, chosen_package_manager, spinner_download, spinner_install)
    })
  } else if (validation_answer.validForNewPackages === false) {
    console.log(chalk.bgMagenta('Errors'), [validation_answer.errors, validation_answer.warnings].filter(e => e !== undefined))
  }
} else if (args.length > 0) {
  console.log('      - Name : ', args[0])
  const validation_answer = validateProjectName(args[0])

  if (validation_answer.validForNewPackages === true) {
    console.log('-----------------------------------')
    spinner_download.start()
    gitClone(template_github_link, `${working_dir_path}/${args[0]}`, function (err) {
      err ? spinner_download.fail('Template download error.') : packageInstall(`${working_dir_path}/${args[0]}`, args[0], chosen_package_manager, spinner_download, spinner_install)
    })
  } else if (validation_answer.validForNewPackages === false) {
    console.log(chalk.bgMagenta('Errors'), [validation_answer.errors, validation_answer.warnings].filter(e => e !== undefined))
  }
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('      - Name? : ', function (project_name) {
    rl.question('      - Description? : ', function (package_description) {
      rl.question('      - Keywords? : ', function (package_keywords) {
        package_keywords = package_keywords.split(/\s*[,*]\s*/g)
        const validation_answer = validateProjectName(project_name)

        if (validation_answer.validForNewPackages === true) {
          console.log('-----------------------------------')
          spinner_download.start()
          gitClone(template_github_link, `${working_dir_path}/${project_name}`, function (err) {
            err ? spinner_download.fail('Template download error.') : packageInstall(`${working_dir_path}/${project_name}`, project_name, chosen_package_manager, spinner_download, spinner_install, package_description)
          })
        } else if (validation_answer.validForNewPackages === false) {
          console.log(
            chalk.bgMagenta('Errors'),
            [validation_answer.errors, validation_answer.warnings].filter(e => e !== undefined)
          )
          rl.close()
        }
      })
    })
  })

  rl.on('close', function () {
    console.log(`\n------------${chalk.red('Cancelled')}--------------`)
    process.exit(0)
  })
}

process.on('SIGINT', () => {
  console.log(`\n------------${chalk.red('Cancelled')}--------------`)
  process.exit(1)
})
