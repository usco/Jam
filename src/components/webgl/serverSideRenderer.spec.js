import assert from 'assert'

describe('server side renderer', function () {
  it('can take a path to a file as input, generate a render of that 3d file as ouput', function (done) {
    const jamPath = './rendererCLI.js'
    const outputPath = './test.png'
    const resolution = ''

    const cmd = `node ${jamPath} ${outputPath} ${resolution}`
    console.log('running ', cmd)

    require('child_process').execSync(cmd)
    // assert.strictEqual(meshSource[0], 'fakeModel.stl')
  })
})
