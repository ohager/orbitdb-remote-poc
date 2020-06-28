# orbitdb-remote-poc

This is proof of concept to demonstrate how IPFS and OrbitDB Pubsub works.

The producer creates an OrbitDb database and writes frequently data to it.
Furthermore, it also publishes a message directly to IPFS, which can be listened to. 

The consumer also connects to the OrbitDB database and replicates it. Additionally, it
listens to the IPFS messages and database updates.

## Installation

> Needs at least NodeJS 12 installed

`npm i`

You need to set the bootstrap addresses for both producer and consumer, i.e.

 

## Run Producer

After configuration run the producer like this:

`npm run start:producer`

On start, it will list the database address, which you need for the consumer as argument:

`Database initialized - Address: /orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer`

## Run Consumer

To run the consumer you need to get the database address from the producer

`npm run start:consumer <address>`

Example:

`npm run start:consumer <address>`

You get the database address from the producers output, the address looks like this:

`/orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer`


## Troubleshooting

Most probably you will have problems with the connections between both participants.

1. You cannot run them on the same computer (without doing some additional tweaks)
2. The addresses need to be added to the bootstrap section in the config files (or added dynamically in the code)
    - the addresses may look like this `/ip4/77.56.45.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaCTy4`
    - the consumer needs the address from the producer, and vice versa
3. Check if your firewall is blocking the ports 4001 and 4002
4. Check if your ports are forwarded, i.e. activate port forwarding in the router  
