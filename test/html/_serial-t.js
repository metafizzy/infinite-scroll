// serialT works kinda like t, but to pass serialized assertions out of .evaluate
// serialT.assertions will be passed out of .evaluate

// https://github.com/avajs/ava/blob/master/docs/03-assertions.md#built-in-assertions
const tKeys = [
  'pass',
  'fail',
  'assert',
  'truthy',
  'falsy',
  'true',
  'false',
  'is',
  'not',
  'deepEqual',
  'notDeepEqual',
];

window.serialT = tKeys.reduce( ( serializedT, method ) => {
  serializedT[ method ] = function( ...args ) {
    serializedT.assertions.push({ method, args });
  };
  return serializedT;
}, { assertions: [] } );
