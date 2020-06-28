const Config = {
  repo: "./ipfs/orbitdb-poc-producer",
  silent: false,
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4001",
        "/ip4/0.0.0.0/tcp/4002/ws"
      ]
    },
    Bootstrap: [
      // To establish a connection between the communicating peers for pubsub
      // you need to add it as bootstrapper
      // Note: You can do this dynamically
      "/ip4/127.0.0.1/tcp/4011/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8",
      "/ip4/77.56.66.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ"
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
