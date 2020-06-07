const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const configProducer = require('./config.producer.json')

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
  console.info('Connecting to IPFS daemon', JSON.stringify(configProducer))
  ipfs = await Ipfs.create(configProducer)
  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  const database = await orbitdb.docstore('database')
  await database.load(1)
  console.info(`Database initialized - Address: ${database.address}`)

  let i = 0
  intervalHandle = setInterval(async () => {
    const hash = await database.put({_id: ++i, foo: 'bar_' + i })
    console.log('added', hash)
  }, 10000)

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  process.on('SIGQUIT', stop)
}


start()
