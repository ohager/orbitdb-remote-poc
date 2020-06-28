# orbitdb-remote-poc

This is a proof of concept to demonstrate how IPFS and OrbitDB Pubsub works.

The producer creates an OrbitDb database and writes frequently data to it.
Furthermore, it also publishes a message directly to IPFS, which can be listened to. 

The consumer connects to the OrbitDB database and replicates it. Additionally, it
listens to the IPFS messages and database updates.

![Demo](./assets/orbitdb-demo.gif)

## Installation

> Needs at least NodeJS 12 installed

`npm i`

You need to set the bootstrap addresses for both producer and consumer.

In a first run you need to start with the producer to get the bootstrap address
```
===========================================
IPFS booted
-------------------------------------------
{
  id: 'QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8',
  publicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD5h4ol2do2vL+6Z3fRkJSeFxqZ3i/so/TkvhwqFf1RJMdUN6osJa3pbX8T5TvFktZmje7hGUzbVhvCH1Yxev0C31HBLNJZHvLnux4tmD439N5lAth16HRkN63+Jm3U1ftzRuCStcZP/d9acA3auAc/b/9RYkttnKAxwar+ED2UrhqnFgetvr6+f35pwLtZACfTRbYTUXRukQ9mVM/Kzy8CNnHYeK7N+xQLc/+LBi24Urm+ECV8nq4mpspjbB8lkTB6LEUQ3Qxoqhc2s+Ob+s5M6Ik/w+saivN6JHx4O58DRm63MviZrk1fPTQjazX1+auopOW9XrKspGtIy1LN/1n5AgMBAAE=',
  addresses: [
    <Multiaddr 047f000001060faba50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/127.0.0.1/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 047f000001060facdd03a50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/127.0.0.1/tcp/4002/ws/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 04c0a8006a060faba50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/192.168.0.106/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 04c0a8006a060facdd03a50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/192.168.0.106/tcp/4002/ws/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>
  ],
  agentVersion: 'js-ipfs/0.46.0',
  protocolVersion: '9000'
}
===========================================
```
The bootstrap address is of format:

`/ip4/<ip>/tcp/4001/p2p/<ipfs-id>`

Example: `/ip4/127.0.0.1/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8`

The database address you will need as argument for the consumer.
Then go to `config.consumer.js` and add the swarm address to the bootstrap section.
Once started the consumer pick up its swarm address and add as bootstrap for the producer.
Then both are able to communicate in a bi-directional manner.
 

## Run Producer

After configuration run the producer like this:

`npm run producer`

On start, it will list the database address, which you need for the consumer as argument:

```
===========================================
Database initialized
Address: /orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer
===========================================
```

## Run Consumer

To run the consumer you need to get the database address from the producer

`npm run consumer <db-address>`

Example:

`npm run start:consumer /orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer`

You get the database address from the producers output:

## Troubleshooting

Most probably you will have problems with the connections between both participants.

1. To run them on the same computer the consumer must be on other ports than the producer

__The Consumer Config__
```js
   // CONSUMER CONFIG
    config: {
       Addresses: {
         Swarm: [
            // set to non-conflicting ports
           "/ip4/0.0.0.0/tcp/4011",
           "/ip4/0.0.0.0/tcp/4012/ws"
         ]
       },
       Bootstrap: [
          // the producers multiaddress string
          // The last segment is the ipfs id, which is different in your case
          // you get the address from the producers start up log (look for 'IPFS booted')
         "/ip4/127.0.0.1/tcp/4001/p2p/QmTW2V77WZzWXk1u7RQHwZGr9SMktVvibWns8oYwQsCfHQ"
       ]
     },
```

__The Producer Config__
```js
    config: {
       Addresses: {
         Swarm: [
           "/ip4/0.0.0.0/tcp/4001",
           "/ip4/0.0.0.0/tcp/4002/ws"
         ]
       },
       Bootstrap: [
          // the consumers multiaddress string
          // The last segment is the ipfs id, which is different in your case
          // you get the address from the consumers start up log (look for 'IPFS booted')
         "/ip4/127.0.0.1/tcp/4011/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8"
       ]
     },
```

> For remote communication you need the external IPs and eventually configure firewall or port forwarding

2. The addresses need to be added to the bootstrap section in the config files (or added dynamically in the code)
    - the addresses may look like this `/ip4/77.56.45.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaCTy4`
    - the consumer needs the address from the producer, and vice versa
3. Check if your firewall is blocking the ports 4001 and 4002
4. Check if your ports are forwarded, i.e. activate port forwarding in the router  
