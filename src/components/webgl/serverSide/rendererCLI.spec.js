import assert from 'assert'
import path from 'path'
import fs from 'fs'

function existsSync (uri) {
  try {
    fs.statSync(uri)
    return true
  }catch (error) {
    return false
  }
}

function rmSync (uri) {
  try {
    fs.unlinkSync(uri)
  }catch (error) {
  }
}

describe('server side renderer', function () {
  it('can take a path to a file as input, generate a render of that 3d file as ouput(stl)', function () {
    this.timeout(5000)
    let jamPath = './rendererCLI.js'
    let inputPath = './testData/cube.stl'
    let outputPath = './test.png'
    let resolution = '160x120'

    jamPath = path.resolve(__dirname, jamPath)
    inputPath = path.resolve(__dirname, inputPath)
    outputPath = path.resolve(__dirname, outputPath)
    outputPath = path.resolve(outputPath)// './demo-data/UM2CableChain_BedEnd.STL.png')

    const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
    require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
    // assert.strictEqual(meshSource[0], 'fakeModel.stl')
    assert.equal(true, existsSync(outputPath))
    rmSync(outputPath)
  })

  /*it('can take a path to a file as input, generate a render of that 3d file as ouput(obj)', function () {
    this.timeout(5000)
    let jamPath = './rendererCLI.js'
    let inputPath = './demo-data/cube.obj'
    let outputPath = './test.png'
    let resolution = '160x120'

    jamPath = path.resolve(__dirname, jamPath)
    outputPath = path.resolve(__dirname, outputPath)
    outputPath = path.resolve(outputPath)

    const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
    require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
    assert.equal(true, existsSync(outputPath))
    fs.rmSync(outputPath)
  })*/

  it('can take a path to a file as input, generate a render of that 3d file as ouput(3mf)', function () {
    this.timeout(15000)
    let jamPath = './rendererCLI.js'
    let inputPath = './testData/cube_gears.3mf'// cube_gears.3mf'// dodeca_chain_loop_color.3mf'// pyramid_vertexcolor.3mf'
    let outputPath = './test.png'
    let resolution = '160x120'

    jamPath = path.resolve(__dirname, jamPath)
    inputPath = path.resolve(__dirname, inputPath)
    outputPath = path.resolve(__dirname, outputPath)
    outputPath = path.resolve(outputPath)

    const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
    require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
    assert.equal(true, existsSync(outputPath))
    rmSync(outputPath)
  })

})
