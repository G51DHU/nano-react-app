import fs from 'fs'
import { execSync, exec } from 'child_process'

export function selectPackageManager () {
  const package_managers = ['pnpm', 'yarn', 'npm']
  for (const index in package_managers) {
    try {
      const existence_check = execSync(`${package_managers[index]} -v`, { stdio: 'pipe', encoding: 'utf-8' })
      if (existence_check.match(/[0-9]+.[0-9]+.[0-9]+/g)) {
        return package_managers[index]
      }
    } catch {
    }
  }
}

export function useGivenPkgMnger (pkg_mnger) {
  return (existingPackageManagers().includes(pkg_mnger))
    ? pkg_mnger
    : (() => {
        console.log('      Invalid Package manager')
        console.log('              given')
        console.log('      Automatically selecting')
        console.log('-----------------------------------')
        return selectPackageManager()
      })()
}
export function existingPackageManagers () {
  // Regex check against package manager versions to see if they exist.
  // Should work on any OS, hopefully.
  const package_managers = ['pnpm', 'yarn', 'npm']
  const existing_package_managers = []
  for (const index in package_managers) {
    try {
      const existence_check = execSync(`${package_managers[index]} -v`, { stdio: 'pipe', encoding: 'utf-8' })
      if (existence_check.match(/[0-9]+.[0-9]+.[0-9]+/g)) {
        existing_package_managers.push(package_managers[index])
      }
    } catch {
    }
  }
  return existing_package_managers
}

// need to pass "spinner_download" instance along,
// otherwise it dosent stop the spinner and causes error.
export function packageInstall (path, project_name, chosen_pkg_mnger, spinner_download, spinner_install, package_description, package_keywords) {
  spinner_download.succeed('Download Success.')
  changePkg(path, project_name, package_description)
  changeIndexHtml(path, project_name, package_description)
  if (package_keywords !== undefined) {
    console.log(package_keywords)
    changePkgKeywords(path, package_keywords)
  }
  spinner_install.start()
  exec(`cd ${path} && ${chosen_pkg_mnger} i`, () => {
    spinner_install.succeed('Packages installed.')
    console.log('-----------------------------------')
  })
}

function changePkg (pkg_path, project_name, package_description = `This is the frontend for ${project_name}.`) {
  const pkgjson_path = `${pkg_path}/package.json`
  const pkgjson_contents = JSON.parse(fs.readFileSync(pkgjson_path, 'utf8'))
  const new_pkgjson_contents = { ...pkgjson_contents, name: project_name, description: package_description }
  fs.writeFileSync(
    pkgjson_path,
    JSON.stringify(new_pkgjson_contents, null, 2),
    'utf8'
  )
}

function changeIndexHtml (pkg_path, project_name, package_description = `This is the frontend for ${project_name}.`) {
  const indexhtml_path = `${pkg_path}/index.html`
  const indexhtml_contents = fs.readFileSync(indexhtml_path, 'utf-8')
  let new_indexhtml_contents = indexhtml_contents.replace('React Vite Micro App', project_name)
  new_indexhtml_contents = new_indexhtml_contents.replace('Web site created using nano-react-app', package_description)
  fs.writeFileSync(indexhtml_path, new_indexhtml_contents, 'utf8')
}

function changePkgKeywords (pkg_path, package_keywords) {
  const pkgjson_path = `${pkg_path}/package.json`
  const pkgjson_contents = JSON.parse(fs.readFileSync(pkgjson_path, 'utf8'))
  const new_pkgjson_contents = { ...pkgjson_contents, keywords: package_keywords }
  const hi = fs.writeFileSync(
    pkgjson_path,
    JSON.stringify(new_pkgjson_contents, null, 2),
    'utf8'
  )
  console.log(hi)
}
