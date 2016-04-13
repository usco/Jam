import assert from 'assert'
import path from 'path'
import fs from 'fs'

describe('server side renderer', function () {
  it('can take a path to a file as input, generate a render of that 3d file as ouput(stl)', function () {
    this.timeout(5000)
    let jamPath = './rendererCLI.js'
    let inputPath = './demo-data/UM2CableChain_BedEnd.STL'
    let outputPath = './test.png'
    let resolution = '320x240'

    jamPath = path.resolve(__dirname, jamPath)
    // inputPath = path.resolve(__dirname, inputPath)
    outputPath = path.resolve(__dirname, outputPath)

    const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
    console.log('running ', cmd)

    require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
    // assert.strictEqual(meshSource[0], 'fakeModel.stl')
    function existsSync (uri) {
      try {
        fs.statSync(uri)
        return true
      }catch (error) {
        return false
      }
    }

    outputPath = path.resolve('./demo-data/UM2CableChain_BedEnd.STL.png')

    assert.equal(true, existsSync(outputPath))
  })
})
