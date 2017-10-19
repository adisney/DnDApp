module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "cc30ca867f8188ca10861f3b5a490bbaf47b564d",
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
  }
}
