
const clAdapters = {
  "httpget" : async (lastVal, params)=> {
    const { get, queryParams, extPath, headers } = params;
    const useCorsAnywhere = true;
    
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
    const { copyPath } = params;
    if (typeof copyPath === 'string')
      copyPath=copyPath.split('.');

    return copyPath.reduce((prev, key)=> prev[key], lastVal)        
  },
  // The spec of JSONparse is not particularly clear. It seems to expect a string
  // https://docs.chain.link/docs/adapters#jsonparse
  // so there fore does HTTPGet need to be modified to return a string?
  // https://docs.chain.link/docs/job-specifications
  "jsonparse" : (lastVal, params)=> {
    const { path } = params;    
    console.log(lastVal, params);
        
    lastVal = JSON.parse(lastVal);
    if (typeof path === 'string')
      path=path.split('.');

    return copyPath.reduce((prev, key)=> prev[key], lastVal)   
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