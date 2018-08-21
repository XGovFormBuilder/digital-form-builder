/*
  Simple in-memory data store used for saving page state.
  Should be replaced with a real db in production.
*/

const hoek = require('hoek')

// let state = {
//   // textField: 'Hi',
//   // datePartsField: new Date(2003, 1, 13, 18, 0)
//   // age: 0,
//   // checkBeforeStart: {
//   //   fullName: 'Dave Stone',
//   //   dob: new Date(1978, 1, 13),
//   //   dateField: new Date(2003, 1, 13),
//   //   dateTimeField: new Date(2003, 1, 13, 17, 0),
//   //   dateTimePartsField: new Date(2003, 1, 13, 18, 0),
//   //   emailAddress: 'd@s.com',
//   //   description: 'desc',
//   //   type: 'soleTrader',
//   //   originCountry: 910400184,
//   //   telephoneNumberField: '09828 393 922',
//   //   timeField: '18:17',
//   //   yesNoField: false
//   // }
// }

async function getState (request) {
  return Promise.resolve(request.yar.get('data') || {})
}

async function mergeState (request, value) {
  const state = request.yar.get('data') || {}
  hoek.merge(state, value, true, false)
  request.yar.set('data', state)
  return Promise.resolve(state)
}

module.exports = { getState, mergeState }
