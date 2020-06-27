const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const {Config} = require('./config.consumer')
const {onShutdown} = require('node-graceful-shutdown')

let ipfs
let intervalHandle
let orbitdb

onShutdown('consumer', async () => {
  console.info('Shutting down')
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }
  await orbitdb.stop()
  await ipfs.stop()
  console.info('Done')
})

async function bootIpfs() {
  console.log('Booting IPFS...')
  console.info('Connecting to IPFS daemon', JSON.stringify(Config))
  ipfs = await Ipfs.create(Config)
  const id = await ipfs.id()
  console.log('IPFS booted', id)

  ipfs.libp2p.on('peer:disconnect', (peerId) => {
    console.log('Lost Connection"', JSON.stringify(peerId.id))
  })

  ipfs.libp2p.on('peer:connect', (peer) => {
    console.log('Producer Found:', peer.id)
  })
  // await ipfs.bootstrap.add("/ip4/77.56.66.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ")
}

async function bootOrbitdb(databaseAddress) {
  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  const database = await orbitdb.open(databaseAddress)
  await database.load(1)
  console.info(`Database initialized - Address: ${database.address}`)

  const replicatedHandler = async (address, count) => {
    console.log(`${address} updated ${count} items`)
  }

  const replicateHandler = async (address, entry) => {
    console.log(`${address} replicated entry`, JSON.stringify(entry))
  }

  const replicationProgressHandler = async (_, ipfsHash, ) => {
  }

  database.events.on('replicate', replicateHandler)
  database.events.on('replicated', replicatedHandler)
  // database.events.on('replicate.progress', replicationProgressHandler)

}

function subscribeTopic(topic) {
  const receiveMsg = (msg) => console.log(msg.data.toString())
  ipfs.pubsub.subscribe(topic, receiveMsg)
  console.log(`subscribed to ${topic}`)
}

async function start() {
  const databaseAddress = process.argv[2]

  if (!databaseAddress) {
    throw Error('Need an address argument')
  }
  await bootIpfs()
  await bootOrbitdb(databaseAddress)
  subscribeTopic('burst-rocks')
}


start()

