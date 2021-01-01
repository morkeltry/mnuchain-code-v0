
const clAdapters = {
  "httpget" : async (lastVal, { useCorsAnywhere = true, ...params })=> {
    const { get, queryParams, extPath, headers } = params;
    // let useCorsAnywhere = true;
    
    const cors_api_host = 'cors-anywhere.herokuapp.com';
    const cors_api_url = 'https://' + cors_api_host + '/';
    const url = useCorsAnywhere ? cors_api_url+get : get;

    console.log(url);
    return await fetch(url)
      .then(res=> res.json())
  },
  "httppost" : async (lastVal, params)=> {
    const { post, queryParams, extPath, headers, body } = params;

  },
  "copy" : (lastVal, params)=> {
    let { copyPath } = params;
    if (typeof copyPath === 'string')
      copyPath=copyPath.split('.');

    return copyPath.reduce((prev, key)=> prev[key], lastVal)        
  },
  // The spec of JSONparse is not particularly clear. It seems to expect a string
  // https://docs.chain.link/docs/adapters#jsonparse
  // so there fore does HTTPGet need to be modified to return a string?
  // https://docs.chain.link/docs/job-specifications
  "jsonparse" : (lastVal, params)=> {
    let { path } = params;    
    console.log(lastVal, params);
        
    lastVal = JSON.parse(lastVal);
    if (typeof path === 'string')
      path=path.split('.');

    return path.reduce((prev, key)=> prev[key], lastVal)   
  },
  // NB some, and all, none and contains, should be a two-part functions (for opening and closing of 'brackets'),
  // each not taking params, as they should iterate over the input array.
  // The are more complex as they require iteration using later members of the jobspec. 
  // This should properly be performed by a single, discrete external adapter.
  // For now, we mock these functions by cheating and passing to them the correct index to look for.
  // some is therefore equivalent here to copy.
  "some" : (lastVal, params)=> {
    const { which, matches } = params;
    return lastVal[which]      
  },
  // find goes some way to solving the cheating required for some, none and contains.
  // we return only the first match.
  "find" : (lastVal, params)=> {
    const { matches, returnMany } = params;
    let { childPath } = params;
    const method=  returnMany ? 'filter' : 'find';
    if (typeof childPath === 'string')
      childPath=childPath.split('.');

    return lastVal
      .map(el=> 
        childPath.reduce((prev, key)=> prev[key], el)
      )
      [method](leaf=>matches.includes(leaf))      
  },
  "findsibling" : (lastVal, params)=> {
    const { matches, returnMany, sibling } = params;
    let { childPath } = params;
    if (typeof childPath === 'string')
      childPath=childPath.split('.');
    const matchLeaf = childPath.pop();

    console.log(params);
    return lastVal
      // .map(el=>{console.log(el); return el})
      .map(el=> 
        childPath.reduce((prev, key)=> prev[key], el)
      )
      // .map(el=>{console.log(el); return el})
      .filter(parent=>matches.includes(parent[matchLeaf]))  
      // .map(el=>{console.log(el); return el})
      .filter((el,idx)=> returnMany || !idx)    
      // .map(el=>{console.log(el); return el})
      .map(parent=> parent[sibling])
  },
  "compare" : (lastVal, params)=> {
    const { operator, value } = params;
    switch (operator) {
      case 'eq': return value == lastVal;
      case 'neq': return value != lastVal;
      case 'gt': return value > lastVal;
      case 'gte': return value >= lastVal;
      case 'lt': return value < lastVal;
      case 'lte': return value <= lastVal;
      case 'true': return true;
      default : {return false}
    }
    
  },
  "multiply" : (lastVal, params)=> {
    const { times } = params;
    return lastVal*times;
  },
  "quotient" : (lastVal, params)=> {
    const { dividend } = params;
    return lastVal/dividend;
    
  },
  "encrypt" : (lastVal, params)=> {
    const { pk, scheme } = params;
    
  },
  "ethuint256" : (lastVal, params)=> {
    const {  } = params;
    
  },

}

export default clAdapters;