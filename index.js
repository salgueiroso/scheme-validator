const{ readFileSync } = require("node:fs");
const fetch = require("node-fetch")

const Ajv = require("ajv").default
const ajv = new Ajv({
    loadSchema : async (url) => {
        return await fetch(url)
    },
    allErrors: true
}) // options can be passed, e.g. {allErrors: true}
// console.log(process.argv)
const args = process.argv.slice(2)

const schemaFile = args[0]
const jsonFile = args[1]

const schema = JSON.parse(readFileSync(schemaFile, 'utf8'))

ajv.compileAsync(schema).then(validate=>{
    const data = JSON.parse(readFileSync(jsonFile, 'utf8'))
    const valid = validate(data)
})

// const validate = ajv.compile(schema)

// const data = JSON.parse(readFileSync(jsonFile, 'utf8'))

// const valid = validate(data)
// if (!valid) console.error(validate.errors)