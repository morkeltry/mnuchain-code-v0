// React and Semantic UI elements.
import React, { useState, useEffect } from 'react';
import { Form, Input, Grid, Message, Select } from 'semantic-ui-react';
// Pre-built Substrate front-end utilities for connecting to a node
// and making a transaction.
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
// Polkadot-JS utilities for hashing data.
import { blake2AsHex } from '@polkadot/util-crypto';

import clAdapters from './helpers/clAdapters';
import populators from './JSONs/jobSpecPopulators';

// Our main Proof Of Existence Component which is exported.
export function Main (props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [block, setBlock] = useState(0);
  const [unpopulatedJobSpec, setUnpopulatedJobSpec] = useState({});
  const [jobSpecPopulator, setJobSpecPopulator] = useState(null);
  const [popParams, setPopParams] = useState('');
  // const setPopParams = (params)=>{ 
  //   if (typeof params==='string')
  //     try {
  //       params = JSON.parse(params);
  //     } catch (e) {
  //       params = {}
  //     }
  //   setPopParamsRaw(params) 
  // };

  // Our `FileReader()` which is accessible from our functions below.
  let fileReader;

  // Takes our file, and creates a digest using the Blake2 256 hash function.
  const bufferToDigest = () => {
    // Turns the file content to a hexadecimal representation.
    const content = Array.from(new Uint8Array(fileReader.result))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const hash = blake2AsHex(content, 256);
    setDigest(hash);
  };

  const quickJsonParse = maybeJson=> {
    typeof maybeJson !== 'object'
      ? maybeJson
      : Array.isArray(maybeJson)
        ? maybeJson
        : Object.keys(maybeJson).map (key=>
            `${key}:${maybeJson[key]}`
          )
  }

  const andLog = (anything, msg)=> {
    if (msg)
      console.log(msg);
    console.log(`(${typeof anything})`, anything);
    // in case of Promise ;)
    anything && anything.then &&
      anything.then(console.log);
    return anything    
  }

  const doChainlinkJob = (job) => new Promise((resolve, reject)=> {
    // NB fileReader will only contain result so long as it is live.
    // console.log(fileReader.result);
    const jobSpec = job || JSON.parse(fileReader.result);
    if (!jobSpec.tasks || !Array.isArray(jobSpec.tasks)) {
      console.error('Expected a property tasks containing an array. Got: ', jobSpec);
      return 
    }
    const cb=finalVal=> {
      console.log('Completed the job!', finalVal);
      resolve(finalVal);
    }
    clAdapters.resolve = lastVal=> cb(lastVal);
    if (jobSpec.tasks[jobSpec.tasks.length-1].type !== 'resolve')
      jobSpec.tasks.push({ type:'resolve' })

    console.log(jobSpec.tasks);

    const jst=jobSpec.tasks.reduce( async (retVal, task, idx, arr)=> {
      if (!clAdapters[task.type.toLowerCase()])
        console.log('UH OH!');
      const rv = clAdapters[task.type.toLowerCase()](await retVal, task.params);
      
      return andLog(rv, `Returning from ${task.type}(${task.params || ''}):` )
    }, 'start from index 0 please')

    const hash = blake2AsHex(content, 256);
    setDigest(hash);
  });

  // Callback function for when a new file is selected.
  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    
    // fileReader.onloadend = bufferToDigest;
    // fileReader.onloadend = doChainlinkJob;
    fileReader.onloadend = loadend=>{
      setUnpopulatedJobSpec(JSON.parse(loadend.target.result)) 
    };

    // fileReader.readAsArrayBuffer(file);
    fileReader.readAsText(file);
  };

  // React hook to update the owner and block number information for a file.
  useEffect(() => {
    let unsubscribe;
    
    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.
    api.query.templateModule
      .proofs(digest, (result) => {        
        // Our storage item returns a tuple, which is represented as an array.
        setOwner(result[0].toString());
        setBlock(result[1].toNumber());
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
    // This tells the React hook to update whenever the file digest changes
    // (when a new file is chosen), or when the storage subscription says the
    // value of the storage item has updated.
  }, [digest, api.query.templateModule]);

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed () {
    return block !== 0;
  }

  // The actual UI elements which are returned from our component.
  return (
    <Grid.Column>
      <h1>Run an oracle job</h1>
      {/* Show warning or success message if the file is or is not claimed. */}
      <Form success={!!digest && !isClaimed()} warning={isClaimed()}>
        <Form.Field>
          {/* File selector with a callback to `handleFileChosen`. */}
          <Input
            type='file'
            id='file'
            label='Your JSON'
            onChange={ e => handleFileChosen(e.target.files[0]) }
          />
          {/* Show this message if the file is available to be claimed */}
          <Message success header='File Digest Unclaimed' content={digest} />
          {/* Show this message if the file is already claimed. */}
          <Message
            warning
            header='File Digest Claimed'
            list={[digest, `Owner: ${owner}`, `Block: ${block}`]}
          />
          { populators && Object.keys(populators).length>1 && <>
            <Select 
              placeholder="Populate jobSpec JSON template with..."
              value={ jobSpecPopulator }
              // onChange={ val => setJobSpecPopulator(val) }
              onChange={ (event,data)=> { setJobSpecPopulator(data.value) } }
              options={ Object.keys(populators).map((populator, idx)=>({
                key: populator,
                value:  populator,
                text: populator || 'No params' 
              })) }
                
            >
            </Select>
            { jobSpecPopulator &&
              <Input 
                placeholder= {`{${populators[jobSpecPopulator].params.join(', ')}}`} 
                onChange={ (event,data)=> { setPopParams(data.value) } }
                value= { popParams.length ? popParams : setPopParams(populators[jobSpecPopulator].sampleInput || ' ') }
              />
            }  
          </>}
        </Form.Field>
        {/* Buttons for interacting with the component. */}
        <Form.Field>
          {/* Button to create a claim. Only active if a file is selected,
          and not already claimed. Updates the `status`. */}
          <TxButton
            accountPair={accountPair}
            label={'Create Claim'}
            setStatus={setStatus}
            type='SIGNED-TX'
            disabled={isClaimed() || !digest}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'createClaim',
              inputParams: [digest],
              paramFields: [true]
            }}
          />
          {/* Button to revoke a claim. Only active if a file is selected,
          and is already claimed. Updates the `status`. */}
          <TxButton
            accountPair={accountPair}
            label='Revoke Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            disabled={!isClaimed() || owner !== accountPair.address}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'revokeClaim',
              inputParams: [digest],
              paramFields: [true]
            }}
          />
          {/* See what happens, innit. */}
          <div
            onClick = { ()=>{ 
              const populatorFn = populators[jobSpecPopulator].populator;
              const params=JSON.parse(popParams);
              doChainlinkJob( populators[jobSpecPopulator].populator(unpopulatedJobSpec, params) );
            } }
          >
            <TxButton          
              accountPair={accountPair}
              label='Run job'
              setStatus={setStatus}
              type='SIGNED-TX'
              disabled={ !unpopulatedJobSpec }
              attrs={{
                palletRpc: 'templateModule',
                callable: 'revokeClaim',
                inputParams: [digest],
                paramFields: [true]
              }}
            />          
          </div>
        </Form.Field>
        {/* Status message about the transaction. */}
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

const logVars = ({api, ...vars})=>{
  console.log('api', api);
  console.log('api.query', api.query);
  if (api.query.templateModule) {
    console.log('api.query.templateModule', api.query.templateModule);
    if (api.query.templateModule.proofs) 
      console.log('api.query.templateModule.proofs', api.query.templateModule.proofs);
    else
      console.log('!!! expected api.query.templateModule.proofs to be non-empty');
  } else
    console.log('!!! expected api.query.templateModule to be non-empty');
    
  return 'Template Module Empty';
}


export default function TemplateModule (props) {
  const { api } = useSubstrate();
  return (api.query.templateModule && api.query.templateModule.proofs
    ? <Main {...props} /> : null // logVars ({api})
    );
}