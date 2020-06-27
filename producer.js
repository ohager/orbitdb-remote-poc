const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const {Config} = require('./config.producer')
const {createIdentity} = require('orbit-db-identity-provider')
const {onShutdown} = require('node-graceful-shutdown')

let ipfs
let intervalHandle
let orbitdb
let database

onShutdown('producer', async () => {
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
}

async function bootOrbitdb() {
  console.info('Starting OrbitDb...')
  const identity = await createIdentity({id: 'privateKey'});
  orbitdb = await OrbitDB.createInstance(ipfs, {identity})
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity)}`)
  database = await orbitdb.docstore('producer', {
    accessController: {
      write: ["*"]
    }
  })
  await database.load()
  console.info(`Database initialized - Address: ${database.address}`)
}

async function publishIpfsMessage(topic, message) {
  await ipfs.pubsub.publish(topic, message)
  console.log(`published [${message.toString()}] to ${topic}`)
}

async function writeDatabase(data) {
  const hash = await database.put(data, {pin: true})
  console.log('put into database:', hash, JSON.stringify(data))
}

async function start() {
  await bootIpfs()
  await bootOrbitdb()

  const entries = await database.get('');
  let i = entries.length ? entries[entries.length - 1]._id : 0
  console.log(`Loaded ${entries.length} entries, last id: ${i}`)

  intervalHandle = setInterval(async () => {
    await publishIpfsMessage('burst-rocks', Buffer.from(`producer_${++i}`))
    await writeDatabase({_id: i, foo: 'bar' + i})
  }, 2000)

}


start()


