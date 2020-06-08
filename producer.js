const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const configProducer = require('./config.producer.json')

let ipfs
let intervalHandle
let orbitdb
let cleanedUp = false

async function stop() {

  if(cleanedUp) {
    return
  }

  if(intervalHandle){
    clearInterval(intervalHandle);
  }
  console.info('Shutting down')
  await orbitdb.stop()
  await ipfs.stop()
  console.info('Done')
  cleanedUp = true
}

async function start() {
  console.info('Connecting to IPFS daemon', JSON.stringify(configProducer))
  ipfs = await Ipfs.create(configProducer)
  const ipfsId = await ipfs.id()
  console.log(`IPFS Peer ID: ${ipfsId.id}`)
  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${orbitdb.identity.id}`)
  database = await orbitdb.docstore('database')
  await database.load(1)
  console.info(`Database initialized - Address: ${database.address}`)

  let i = 0
  intervalHandle = setInterval(async () => {
    const hash = await database.put({_id: ++i, foo: 'bar_' + i })
    console.log('added', hash)
  }, 10000)


  console.log(`Open consumer: npm run start:consumer ${ipfsId.id} ${database.address}`)

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()
