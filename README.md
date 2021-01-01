# Modified Substrate Front End Template

This frontend fakes running Chainlink jobs. It uses a superset of Chainlink's adapters, which are [described here](https://docs.chain.link/docs/job-specifications). The actual functionality is local and is defined by `clAdapters.js`. A sample job taking parameters is specified by `didBtcAddyReceiveXAmount.js`, as populated by `didBtcAddyReceiveXAmount.json`.
They are all run fron the frontend, to demonstrate functionality. However, the frontend does connect to a substrate chain, so the results can be updated on a chain with suitable funcationality by calling a caller the chain, using the `.then` method of `doChainlinkJob`.

`TemplateModule.js` is where in React the logic is. The `helpers` and `JSONs` folders have also been added.

## Testing it
* Install as below
* In 'Run an oracle job', load `didBtcAddyReceiveXAmount.js`
* Select the matching populator in the dropdown below that.
* You must pass parameters to the populator and they must be in valid JSON (no tolerant parsing ;) . The two params provided work to provide a result at the time of commit. The datas ource here is paginated but naively parsed. If this data is out of date, open the output returned from the second run of Copy (logs from line 64) and use the value from `prev_value` to replace the `txAmount`. 


## Substrate Front End Template

This template allows you to create a front-end application that connects to a
[Substrate](https://github.com/paritytech/substrate) node back-end with minimal
configuration. To learn about Substrate itself, visit the
[Substrate Developer Hub](https://substrate.dev).

The template is built with [Create React App](https://github.com/facebook/create-react-app)
and [Polkadot js API](https://polkadot.js.org/api/). Familiarity with these tools
will be helpful, but the template strives to be self-explanatory. To learn how
this template was built, visit the
[Substrate Front-End Tutorial](https://substrate.dev/docs/en/tutorials/substrate-front-end/).

## Using The Template

### Installation


```bash
# Clone the repository
git clone https://github.com/substrate-developer-hub/substrate-front-end-template.git
cd ./substrate-front-end-template
yarn install
```

## Usage

You can start the template in development mode to connect to a locally running node

```bash
npm run start
```

You can also build the app in production mode,

```bash
npm run build
```
and open `build/index.html` in your favorite browser.

## Configuration

The template's configuration is stored in the `src/config` directory, with
`common.json` being loaded first, then the environment-specific json file,
and finally environment variables, with precedence.

* `development.json` affects the development environment
* `test.json` affects the test environment, triggered in `yarn test` command.
* `production.json` affects the production environment, triggered in
`npm run build` command.

Some environment variables are read and integrated in the template `config` object,
including:

* `REACT_APP_PROVIDER_SOCKET` overriding `config[PROVIDER_SOCKET]`
* `REACT_APP_DEVELOPMENT_KEYRING` overriding `config[DEVELOPMENT_KEYRING]`

More on [React environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables).

When writing and deploying your own front end, you should configure:

* `CUSTOM_TYPES` in `src/config/common.json`. See
  [Extending types](https://polkadot.js.org/api/start/types.extend.html).
* `PROVIDER_SOCKET` in `src/config/production.json` pointing to your own
  deployed node.
* `DEVELOPMENT_KEYRING` in `src/config/common.json` be set to `false`.
  See [Keyring](https://polkadot.js.org/api/start/keyring.html).

### Specifying Connecting Node

There are two ways to specify it:

* With `PROVIDER_SOCKET` in `{common, development, production}.json`.
* With `rpc=<ws or wss connection>` query paramter after the URL. This overrides the above setting.

## Reusable Components

### useSubstrate Custom Hook

The custom hook `useSubstrate` provides access to the Polkadot js API and thus the
keyring and the blockchain itself. Specifically it exposes this API.

```js
{
  socket,
  types,
  keyring,
  keyringState,
  api,
  apiState,
}
```

- `socket` - The remote provider socket it is connecting to.
- `types` - The custom types used in the connected node.
- `keyring` - A keyring of accounts available to the user.
- `keyringState` - One of `"READY"` or `"ERROR"` states. `keyring` is valid
only when `keyringState === "READY"`.
- `api` - The remote api to the connected node.
- `apiState` - One of `"CONNECTING"`, `"READY"`, or `"ERROR"` states. `api` is valid
only when `apiState === "READY"`.


### TxButton Component

The [TxButton](./src/substrate-lib/components/TxButton.js) handles basic
[query](https://polkadot.js.org/api/start/api.query.html) and
[transaction](https://polkadot.js.org/api/start/api.tx.html) requests to the
connected node. You can reuse this component for a wide variety of queries and
transactions. See [src/Transfer.js](./src/Transfer.js) for a transaction example
and [src/ChainState.js](./src/ChainState.js) for a query example.

### Account Selector

The [Account Selector](./src/AccountSelector.js) provides the user with a unified way to
select their account from a keyring. If the Balances module is installed in the runtime,
it also displays the user's token balance. It is included in the template already.
