const populators= {
  null : { populate : x=>x , params : [] }
};

import didBtcAddyReceiveXAmount from './didBtcAddyReceiveXAmount.js';
populators.didBtcAddyReceiveXAmount = {
  populator : didBtcAddyReceiveXAmount,
  params : ['recipientAddress', 'txAmount'],
  sampleInput : '{ "recipientAddress" : "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX", "txAmount": 15291516 }'
};

export default populators;


