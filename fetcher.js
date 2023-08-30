const fs = require('fs');
const rl = require('readline'); 
const request = require('request');
const args = process.argv.slice(2);
const url = args[0];

let rlInt = rl.createInterface(process.stdin, process.stdout);
let localPath = args[1];

let acceptableFilePathChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-./ ';
for (let char of localPath) {
  if (!acceptableFilePathChars.includes(char)) {
    throw new Error('Invalid character in file path');
  }
}

let splitPath = localPath.split('/');
let testPath = '';

// Loop through the entire given path and ensure that all directories exist before trying to write
for (let i = 0; i < splitPath.length; i++) {
  testPath += '/' + splitPath[i];
  if (!fs.existsSync(testPath)) {
    throw new Error("File path does not exist");
  }
}

request(url, (error, response, body) => {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error('URL is invalid');
  }

  // File already exists so keep adding '1's to the end of the filename until it's unique
  if (fs.existsSync(localPath)) {
    rlInt.setPrompt('File exists.  Do you want to overwrite y/[N]? ');
    rlInt.prompt();
    rlInt.on('line', (data) => {
      if (! data.toLowerCase() === 'y') {
        throw new Error('Not overwriting');
      } else {
        writeFile(localPath, body);
        rlInt.close();
      }
    });
  } else {
    writeFile(localPath, body);
  }
});

const writeFile = function (localPath, body) {
  fs.writeFile(localPath, body, error => {
    if (error) {
      console.log(error);
    }
    console.log(`Downloaded and saved ${body.length} bytes to ${localPath}`);
    process.exit();
  });
}