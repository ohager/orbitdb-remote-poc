const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const configConsumer = require('./config.consumer.json')

let ipfs
let intervalHandle
let orbitdb

async function stop() {
  console.info('Shutting down')
  await orbitdb.stop()
  await ipfs.stop()
  if(intervalHandle){
    clearInterval(intervalHandle);
  }
  console.info('Done')
}

async function start() {
  const peerId = process.argv[2]
  const databaseAddress = process.argv[3]

  if(!peerId){
    throw Error('Need an peerId argument')
  }

  if(!databaseAddress){
    throw Error('Need an address argument')
  }

  console.info('Connecting to IPFS daemon', JSON.stringify(configConsumer, null, '\t'))
  ipfs = await Ipfs.create(configConsumer)
  const swarmAddress= `/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/p2p/${peerId}`
  console.info('Connecting to swarm using', swarmAddress)
  await ipfs.swarm.connect(swarmAddress)
  console.info('Starting OrbitDb...')
  ipfs.pubsub.subscribe('fruit-of-the-day', ({data}) => {
    console.log(JSON.stringify(data.toString()))
  })

  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  const database = await orbitdb.open(databaseAddress)
  await database.load()
  console.info(`Database initialized - Address: ${database.address}`)

  // database.events.on('replicate', async (address, entry) => {
  //   if(!entry.payload) return
  //   console.log(`Got data from [${address}]: `, JSON.stringify(entry.payload.value))
  // })

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()
