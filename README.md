#### Demo

[ThePeoplesBank App](https://gringotts-defi.vercel.app/)

#### Clone this repository

`git clone https://github.com/cybergirldinah/decentralized-banking-app`

#### Install Dependencies

Dependencies are stored in the `package.json` file. From the main project folder run:
`npm install`

#### Set up truffle-config.js settings

Set the port to `7545` and networkID to `5777`:

```
development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "5777",
    }
```

#### Truffle Test in Development Mode

In the main project folder run:
`truffle test`

#### Future Improvements

1. Add price feed for ETH
2. Allow users to earn more through Compound
3. Create ETH/GAL liquidity pool on Uniswap
