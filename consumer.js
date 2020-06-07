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
  const databaseAddress = process.argv[2]

  if(!databaseAddress){
    throw Error('Need an address argument')
  }

  console.info('Connecting to IPFS daemon', JSON.stringify(configConsumer))
  ipfs = await Ipfs.create(configConsumer)
  ipfs.bootstrap.add('/ip6/::1/tcp/4001/p2p/QmSi5Gj2XNYigN5VaPQsMWuCAK98QF1vYk59ZwmfzjP4fW')
  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  const database = await orbitdb.open(databaseAddress)
  await database.load()
  console.info(`Database initialized - Address: ${database.address}`)

  database.events.on('replicated', async () => {
    console.log('replicated')
    const records = await database.get('')
    records.forEach(console.log)
  })

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()
