import test from 'ava'
import { updateComponents } from './transforms'

test('transforms:updateComponents:translation(basic)', t => {
  const inputs = [
    {id: 0, trans: 'pos', value: [0, 7.2, -2.98], settings: {}}
  ]

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const currentState = {
    0: {
      pos: [5, 4, -2],
      rot: [0, 1, 0],
      sca: [1, 1, 1]
    }
  }

  const newState = updateComponents(transformDefaults, currentState, inputs)
  const expState = {
    0: {
      pos: [0, 7.2, -2.98],
      rot: [0, 1, 0],
      sca: [1, 1, 1]
    }
  }

  t.deepEqual(newState, expState)
})

test('transforms:updateComponents:translation(multi)', t => {

  const inputs = [
    {id: 0, trans: 'pos', value: [0, 7.2, -2.98], settings: {}},
    {id: 1, trans: 'pos', value: [-3, 0.3, 21.02], settings: {}}
  ]

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const currentState = {
    0: {
      pos: [5, 4, -2],
      rot: [0, 1, 0],
      sca: [1, 1, 1]
    },
    1: {
      pos: [1.2, -0.2, 0],
      rot: [2.7, 1, 0],
      sca: [1, 1, 1]
    }
  }

  const newState = updateComponents(transformDefaults, currentState, inputs)
  const expState = {
    0: {
      pos: [1.9, 9.3, -3.98],
      rot: [0, 1, 0],
      sca: [1, 1, 1]
    },
    1: {
      pos: [-4.8999999999999995, -1.7999999999999998, 22.02],// FIXME : damn you JS  !!
      rot: [2.7, 1, 0],
      sca: [1, 1, 1]
    }
  }

  t.deepEqual(newState, expState)
})

test('transforms:updateComponents:scaling(basic, uniform)', t => {
  const inputs = [
    {id: 0, trans: 'sca', value: [0, 22.4, 0], settings: {uniformScaling: true}}
  ]

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const currentState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    }
  }

  const newState = updateComponents(transformDefaults, currentState, inputs)
  const expState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [22.4, 22.4, 22.4]
    }
  }

  t.deepEqual(newState, expState)
})


test('transforms:updateComponents:scaling(basic, uniform, snapping)', t => {
  const inputs = [
    {id: 0, trans: 'sca', value: [0, 22.45, 0], settings: {uniformScaling: true, snapScaling: true}}
  ]

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const currentState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    }
  }

  const newState = updateComponents(transformDefaults, currentState, inputs)
  const expState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [22.5, 22.5, 22.5] // FIXME : not 100% sure , shout it actually be 22.4 ?
    }
  }

  t.deepEqual(newState, expState)
})

test('transforms:updateComponents:rotation(basic, snapping)', t => {
  const inputs = [
    {id: 0, trans: 'rot', value: [0, Math.PI / 2 + 2, 0], settings: {snapRotation: true}}
  ]

  const transformDefaults = {
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  const currentState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    }
  }

  const newState = updateComponents(transformDefaults, currentState, inputs)
  const expState = {
    0: {
      pos: [0, 0, 0],
      rot: [0, 3.490658503988659, 0], // FIXME: DOUBLE CHECK !! seems fishy
      sca: [1, 1, 1]
    }
  }

  t.deepEqual(newState, expState)
})
