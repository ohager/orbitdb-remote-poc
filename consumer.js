const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const configConsumer = require('./config.consumer.json')

let ipfs
let intervalHandle
let orbitdb

async function stop() {
  if(intervalHandle){
    clearInterval(intervalHandle);
  }

  console.info('Shutting down')
  await orbitdb.stop()
  await ipfs.stop()
  console.info('Done')
}

async function start() {
  const databaseAddress = process.argv[2]

  if(!databaseAddress){
    throw Error('Need an address argument')
  }

  console.info('Connecting to IPFS daemon', JSON.stringify(configConsumer))
  ipfs = await Ipfs.create(configConsumer)
  const id = await ipfs.id()
  console.log('IPFS connected', id)

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
    const records = await database.get('')
    records.forEach(console.log)
  }

  database.events.on('replicated', replicatedHandler)

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()
