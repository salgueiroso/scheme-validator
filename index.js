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
            throw new Error(validate.errors.map(e => `Propriedade "${e.propertyName || e.instancePath}" na referencia "${e.schemaPath}" do esquema viola a regra "${e.keyword}" com a mensagem "${e.message}"`).join("\n"))
        }

        return valid
    })

    return result ? "Valid JSON" : "Invalid JSON"
}


execute().then(console.log)


