import { Output } from '@pulumi/pulumi';

import { ServerData } from '../../model/server';
import { networkConfig, serverConfig } from '../configuration';
import { hetznerIdentifierToNumber } from '../util/hetzner';
import { locationToDatacenter } from '../util/hetzner/location';

import { createFirewall } from './firewall';
import { createSubnet, getOrCreateNetwork } from './network';
import { createPrimaryIP } from './primary_ip';
import { createServer } from './server';
import { registerSSHKey } from './ssh_key';

/**
 * Creates the instance with Hetzner Cloud.
 *
 * @param {Output<string>} publicSSHKey the public SSH key
 * @returns {Promise<ServerData>} the server
 */
export const createHetznerInstance = async (
  publicSSHKey: Output<string>,
): Promise<ServerData> => {
  // location & datacenter
  const datacenter = locationToDatacenter(serverConfig.location);

  // ssh key
  const hetznerSSHKey = registerSSHKey(publicSSHKey);

  // network
  const network = await getOrCreateNetwork();
  createSubnet(network, networkConfig.subnetCidr);
  const firewall = createFirewall();
  const primaryIPs = {
    ipv4: createPrimaryIP('ipv4', datacenter),
    ipv6: createPrimaryIP('ipv6', datacenter),
  };
  const primaryIPAddresses = {
    ipv4: primaryIPs.ipv4.ipAddress,
    ipv6: primaryIPs.ipv6.ipAddress.apply((ip) => `${ip}1`),
  };

  // server
  const server = createServer(
    serverConfig.location,
    serverConfig.type,
    hetznerSSHKey.id,
    firewall.id.apply(hetznerIdentifierToNumber),
    network,
    serverConfig.ipv4,
    primaryIPs.ipv4.id.apply(hetznerIdentifierToNumber),
    primaryIPs.ipv6.id.apply(hetznerIdentifierToNumber),
  );

  return {
    resource: server,
    privateIPv4: Output.create(serverConfig.ipv4),
    publicIPv4: primaryIPAddresses.ipv4,
    publicIPv6: primaryIPAddresses.ipv6,
    sshIPv4: serverConfig.publicSsh
      ? primaryIPAddresses.ipv4
      : Output.create(serverConfig.ipv4),
    network: Output.create(networkConfig.name),
    // TODO: old data
    hostname: '',
    ipv4Address: '',
    ipv6Address: '',
    serverId: server.id.apply(hetznerIdentifierToNumber),
  };
};
