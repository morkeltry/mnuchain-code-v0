
// These functions are written in JS to demonstrate for the frontend.
// They accept an external JSON template for convenience
// They will eventually be written in Rust to compile to reproducible WASM so that 
// only a defined set of side effects (eg differences in external, ie API, state)
// will be legitimate grounds for two nodes advertising the same WASM hash yet reporting a different result.
// This is eventually intended to form an audit layer for the oracles.

// { ...params } -> Chainlink Job spec JSON

import defaultJsonTemplate from './didBtcAddyReceiveXAmount.json';

export default ( jsonTemplate=defaultJsonTemplate, params )=> {
  console.log(params);
  console.log(jsonTemplate);
  console.log(jsonTemplate.tasks);
  const { recipientAddress, txAmount, startAt, endAt } = params;
  if (!recipientAddress)
    console.log('Should throw an error here. Probably you did not enter params');

  console.log(jsonTemplate.tasks[0].params.get);
  jsonTemplate.tasks[0].params.get = jsonTemplate.tasks[0].params.get.replace('ADDRESS', recipientAddress);
  console.log(jsonTemplate.tasks[0].params.get);
  console.log(jsonTemplate.tasks[4].params.matches);
  jsonTemplate.tasks[4].params.matches.push(txAmount);
  console.log(jsonTemplate.tasks[4].params.matches);

  if (startAt)
    jsonTemplate.startAt = startAt;
  if (endAt)
    jsonTemplate.endAt = endAt;
  console.log('will return:', jsonTemplate);
  return jsonTemplate
}

