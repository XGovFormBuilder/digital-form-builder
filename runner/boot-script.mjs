import {readFileSync, writeFileSync} from 'node:fs';
import {execSync} from 'node:child_process'

const bootcmd = process.argv[2];

const configMap = new Map()
configMap.set('runner/dist/server/forms/updated-feedback-form.json','FEEDBACK_WEBHOOK')
configMap.set('runner/dist/server/forms/updated-ukhsa-webform.json', 'WEBFORM_WEBHOOK')

configMap.forEach((envVar, fileName) => {
    let formsJSON=JSON.parse(readFileSync(fileName));
    formsJSON.outputs[0].outputConfiguration.url=process.env[envVar];
    console.log(JSON.stringify(formsJSON));
    writeFileSync(fileName, JSON.stringify(formsJSON));
})

console.log(execSync(bootcmd).toString());