const { readFileSync } = require("node:fs");
// const fetch = require("node-fetch")


const Ajv = require("ajv").default
const ajv = new Ajv({
    loadSchema: getFile,
    allErrors: true,
    verbose: true,
    strict: true,

})

async function getFile(url) {
    const schema = ajv.getSchema(url)
    if (!!schema) {
        return schema
    } else {
        let result = await fetch(url, { redirect: "follow" })
        if (!result.ok) throw new Error(result.statusText)
        let json = await result.json()
        return json
    }
}

async function execute() {
    const args = process.argv.slice(2)

    const schemaFile = args[0]
    const jsonFile = args[1]

    const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))

    const result = await ajv.compileAsync(schema).then(validate => {
        const data = JSON.parse(readFileSync(jsonFile, 'utf8'))
        const valid = validate(data)

        if (!valid) {
            const errMessage = validate.errors.map(e => `The "${e.propertyName || e.instancePath}" property in the "${e.schemaPath}" section of the schema violates the "${e.keyword}" with the following message: "${e.message}"`).join("\n")
            throw new Error(errMessage)
        }

        return valid
    })

    return result ? "Valid JSON" : "Invalid JSON"
}


execute().then(console.log)


