import fs from "fs"
import {exec} from 'child_process'

// need to pass "spinner_download" instance along, 
// otherwise it dosent stop the spinner and causes error.
export function packageInstall(path, projectName, existing_package_managers,  spinner_download, spinner_install, package_description){
    spinner_download.succeed("Download Success.")
    changePkg(path, projectName, package_description)
    changeIndexHtml(path, projectName, package_description)

    spinner_install.start()
    exec(`cd ${path} && ${existing_package_managers[0]} i`, ()=>{
        spinner_install.succeed("Packages installed.")
        console.log("-----------------------------------")})
}

export function packageDownloadFail(spinner_download){
    spinner_download.fail('Template download error.')
}


function changePkg(pkgPath, projectName, package_description = `This is the frontend for ${projectName}.`){
    const pkgjson_path = `${pkgPath}/package.json`
    const pkgjson_contents = JSON.parse(fs.readFileSync(pkgjson_path, "utf8"));
    const new_pkgjson_contents = { ...pkgjson_contents, name: projectName, description: package_description };
    fs.writeFileSync(
        pkgjson_path,
        JSON.stringify(new_pkgjson_contents, null, 2),
        "utf8",
    );
}

function changeIndexHtml(pkgPath, projectName, package_description = `This is the frontend for ${projectName}.`){
    const indexhtml_path = `${pkgPath}/index.html`
    const indexhtml_contents = fs.readFileSync(indexhtml_path, "utf-8")
    var new_indexhtml_contents = indexhtml_contents.replace("React Vite Micro App", projectName)
    new_indexhtml_contents = new_indexhtml_contents.replace("Web site created using nano-react-app", package_description)
    fs.writeFileSync(indexhtml_path, new_indexhtml_contents, "utf8")
}



