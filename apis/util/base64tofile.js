const fs = require("fs")

const convertFile = async (filestring, filename, name) => {
    const base64String = filestring
    const base64Image = base64String.split(";base64,").pop()
    const path = fs.realpathSync('uploads', []) + "/" + name
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    const fileName = Date.now() + "-" + filename
    const filepath = path + "/" + fileName
    fs.open(`${filepath}`, 'w', async (err, file) => {
        if (err) console.error("Error while opening file :: " + err);
        fs.writeFile(file, base64Image, { encoding: 'base64' }, (_err) => {
            if (_err) console.error("Error while writing file :: " + _err)
            console.log('File successfully created, file name :: ' + fileName)
        })
    })
    return filepath.split('uploads')[1]
}

module.exports = convertFile