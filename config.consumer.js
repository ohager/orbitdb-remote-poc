const Config = {
  repo: "./ipfs/orbitdb-poc-consumer",
  silent: false,
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4001",
        "/ip4/0.0.0.0/tcp/4002/ws"
      ]
    },
    Bootstrap: [
      // "/ip4/77.56.66.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ"
    ]
  },
  Discovery: {
    MDNS: {
      Enabled: false,
      Interval: 10
    }
  },
  EXPERIMENTAL: {
    pubsub: true
  }
}

module.exports = {
  Config
}
