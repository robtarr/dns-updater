const fetch = require('node-fetch');
const { Env } = require("@humanwhocodes/env");
const DigitalOcean = require('do-wrapper').default;

require('dotenv').config();
const env = new Env();

async function getPublicIp() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
}

async function getZoneRecordId(api, domain, recordName) {
  console.log(`Getting record for ${recordName}`);
  return api.domains.getAllRecords(domain, recordName, true)
    .then(response => response.filter((record) => record.name === recordName))
    .then(result => {
      if (result[0]) {
        return result[0].id;
      } else {
        return null;
      }
  });
}

async function createZoneRecord(api, domain, recordName, ip) {
  record = {
    name: recordName,
    type: "A",
    data: ip
  };

  console.log(`Creating record:`, record);
  api.domains.createRecord(domain, record);
}

async function updateZoneRecord(api, domain, zoneRecordId, ip) {
  record = {
    data: ip
  };

  console.log(`Updating record:`, record);
  api.domains.updateRecord(domain, zoneRecordId, record);
}

async function go() {
  console.log(new Date());

  const domain = env.require('DOMAIN');
  const entryName  = env.require('ENTRY_NAME');
  const accessToken = env.require('DIGITAL_OCEAN_ACCESS_TOKEN');

  const digitalOcean = new DigitalOcean(accessToken);
  const publicIp = await getPublicIp();

  console.log('Public IP:', publicIp);

  try {
    const zoneRecordId = await getZoneRecordId(digitalOcean, domain, entryName);

    if (zoneRecordId) {
      await updateZoneRecord(digitalOcean, domain, zoneRecordId, publicIp);
    } else {
      await createZoneRecord(digitalOcean, domain, entryName, publicIp);
    }
  } catch(e) {
    console.error(e);
  }
}

go();
