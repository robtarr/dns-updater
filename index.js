const fetch   = require('node-fetch');
const { Env } = require("@humanwhocodes/env");
const DNSimple = require('dnsimple');

require('dotenv').config();

const env = new Env();

async function getPublicIp() {
  const response = await fetch('https://api.ipify.org?format=json');

  const data = await response.json();

  return data.ip;
}

async function getZoneRecordId(credentials, accountId, recordName, zone) {
  const dnsimple = DNSimple(credentials);

  return new Promise( (resolve, reject) => {
    dnsimple
      .zones
      .listZoneRecords(accountId, zone, {name: recordName})
      .then( response => {
        if (response.pagination.total_entries >= 1) {
          resolve(response.data[0].id);
        } else {
          resolve(undefined);
        }
      })
      .catch(reject);
  });
}

async function createZoneRecord(credentials, accountId, recordName, zone, ip) {
  const dnsimple = DNSimple(credentials);

  record = {
    name: recordName,
    type: "A",
    content: ip,
  };

  return new Promise( (resolve, reject) => {
    dnsimple.zones.createZoneRecord(accountId, zone, record)
      .then(resolve)
      .catch(reject);
  });
}

async function updateZoneRecord(credentials, accountId, recordId, zone, ip) {
  const dnsimple = DNSimple(credentials);

  record = { content: ip };

  return new Promise( (resolve, reject) => {
    dnsimple.zones.updateZoneRecord(accountId, zone, recordId, record)
      .then(resolve)
      .catch(reject);
  });
}

async function go() {
  console.log(new Date());

  const accountId = env.require('DNSIMPLE_ACCOUNT_ID');
  const domain = env.require('DOMAIN');
  const entryName  = env.require('ENTRY_NAME');
  const dnsimpleCredentials = {
    accessToken: env.require('DNSIMPLE_ACCESS_TOKEN'),
    baseUrl: env.require('DNSIMPLE_BASE_URL'),
  };

  const publicIp  = await getPublicIp();

  console.log('Public IP:', publicIp);

  try {
    const zoneRecordId = await getZoneRecordId(dnsimpleCredentials, accountId, "vpn", "cromwellhaus.com");

    if (zoneRecordId) {
      await updateZoneRecord(dnsimpleCredentials, accountId, zoneRecordId, "cromwellhaus.com", publicIp);
    } else {
      await createZoneRecord(dnsimpleCredentials, accountId, "vpn", "cromwellhaus.com", publicIp);
    }
  } catch(e) {
    console.error(e);
  }
}

go();
