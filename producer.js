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

  // This is a way to create an OrbitDB identity based on external ids!
  const identity = await createIdentity({id: 'privateKey'});
  orbitdb = await OrbitDB.createInstance(ipfs, {identity})
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity)}`)

  // Granting write access to all
  // In a real world scenario this should be limited
  database = await orbitdb.docstore('producer', {
    accessController: {
      write: ["*"]
    }
  })

  // loading only one item is faster than loading all....
  // but at least one is needed
  await database.load(1)

  // The address is used by others who wants to access the database, i.e. consumer
  console.info(`Database initialized - Address: ${database.address}`)

}

async function publishIpfsMessage(topic, message) {
  await ipfs.pubsub.publish(topic, message)
  console.log(`published [${message.toString()}] to ${topic}`)
}

async function writeDatabase(data) {
  const hash = await database.put(data)
  console.log('put into database:', hash, JSON.stringify(data))
}

function subscribeDatabaseUpdates() {
  database.events.on('replicate', (address, {payload}) => {
    console.log(`${address} updated database`, JSON.stringify(payload))
  })
}

async function getLatestId() {
  const entries = await database.get('');
  let i = 0
  if (entries.length) {
    const id = entries[entries.length - 1]._id
    i = parseInt(id.replace('p-', ''))
  }
  console.log(`Loaded ${entries.length} entries, last id: ${i}`)
  return i
}

async function start() {
  await bootIpfs()
  await bootOrbitdb()
  subscribeDatabaseUpdates()

  let i = await getLatestId()
  intervalHandle = setInterval(async () => {
    i += 1
    await publishIpfsMessage('burst-rocks', Buffer.from(`producer_${i}`))
    await writeDatabase({_id: `p-${i}`, foo: 'bar' + i})
  }, 2000)
}


start()


