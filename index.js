const path = require('path')
const fs = require('fs')

function dynadot_prices() {
    const dynadot_json = fs.readFileSync(path.join(__dirname,'dynadot.json'))
    return JSON.parse(dynadot_json)
}

module.exports={
    dynadot_prices
}