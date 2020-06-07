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
  ipfs.bootstrap.add('/ip6/::1/tcp/4001/p2p/QmSi5Gj2XNYigN5VaPQsMWuCAK98QF1vYk59ZwmfzjP4fW')
  const ipfsId = await ipfs.id()
  console.log(`list: ${JSON.stringify(ipfsId)}`)
  console.info('Starting OrbitDb...')
  orbitdb = await OrbitDB.createInstance(ipfs)
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity.id)}`)
  database = await orbitdb.docstore('database', {sync:true})
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
