const base45 = require('base45');
const cbor = require('cbor');
const fs = require('fs')
const jpeg = require('jpeg-js');
const jsQR = require("jsqr");
const pako = require('pako');
const lodash = require('lodash');

const args = require('minimist')(process.argv.slice(2));

if (lodash.isNil(args.f)) {
    console.log(`I need the -f parameter to be the name of the cert and the cert in the same directory as the index.js script to actually work`)
} else {
    // Read the file and decode QR
    const greenpassJpeg = fs.readFileSync(args.f);
    const greenpassImageData = jpeg.decode(greenpassJpeg, {useTArray: true})
    const decodedGreenpass = jsQR(greenpassImageData.data, greenpassImageData.width, greenpassImageData.height);
    // Remove unnecesary HC1 header
    const greenpassBody = decodedGreenpass.data.substr(4);
    // Decode base45
    const decodedData = base45.decode(greenpassBody);
    // Prepare object and decode
    const output = pako.inflate(decodedData);
    const results = cbor.decodeAllSync(output);
    [headers1, headers2, cbor_data, signature] = results[0].value;
    const greenpassData = cbor.decodeAllSync(cbor_data);
    console.log (JSON.stringify(greenpassData[0].get(-260).get (1), null, 2));

}