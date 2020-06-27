const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const {Config} = require('./config.producer')
const {createIdentity} = require('orbit-db-identity-provider')
const {onShutdown} = require('node-graceful-shutdown')

let ipfs
let intervalHandle
let orbitdb

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
  return ipfs
}

async function bootOrbitdb() {
  console.info('Starting OrbitDb...')
  const identity = await createIdentity({id: 'privateKey'});
  orbitdb = await OrbitDB.createInstance(ipfs, {identity})
  console.info(`Orbit Database instantiated ${JSON.stringify(orbitdb.identity)}`)
  const database = await orbitdb.docstore('test2')
  await database.load(1)
  console.info(`Database initialized - Address: ${database.address}`)
}

async function start() {
  await bootIpfs()
  await bootOrbitdb()

  let i = 0
  intervalHandle = setInterval(async () => {
    const topic = 'burst-rocks'
    const msg = Buffer.from(`sodium_${++i}`)
    await ipfs.pubsub.publish(topic, msg)
    console.log(`published [${msg.toString()}] to ${topic}`)
  }, 2000)

}


start()


