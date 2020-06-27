const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const {Config} = require('./config.consumer')

let ipfs
let intervalHandle
let reconnectInterval
let orbitdb

async function stop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  if (reconnectInterval) {
    clearInterval(reconnectInterval)
  }

  console.info('Shutting down')
  await orbitdb.stop()
  await ipfs.stop()
  console.info('Done')
}


async function start() {
  const databaseAddress = process.argv[2]

  if (!databaseAddress) {
    throw Error('Need an address argument')
  }

  console.info('Connecting to IPFS daemon', JSON.stringify(Config))
  ipfs = await Ipfs.create(Config)

  ipfs.libp2p.on('peer:disconnect', (p, ...a) => {
    console.log('Lost Producer', JSON.stringify(...a))
  })

  ipfs.libp2p.on('peer:connect', (peer) => {
    console.log('Producer Found', peer)
  })

  const id = await ipfs.id()
  console.log('IPFS connected', id)

  await ipfs.bootstrap.add("/ip4/77.56.66.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaC7HZ")

  const topic = 'burst-rocks'
  const receiveMsg = (msg) => console.log(msg.data.toString())
  await ipfs.pubsub.subscribe(topic, receiveMsg)
  console.log(`subscribed to ${topic}`)

  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  const database = await orbitdb.open(databaseAddress)
  await database.load(1)
  console.info(`Database initialized - Address: ${database.address}`)

  const replicatedHandler = async () => {
    console.log('--- Database was updated ----')
  }

  const replicationProgressHandler = async (_, ipfsHash) => {
  }

  database.events.on('replicated', replicatedHandler)
  database.events.on('replicate.progress', replicationProgressHandler)

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()

