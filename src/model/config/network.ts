/**
 * Defines network configuration.
 */
export interface NetworkConfig {
  readonly nameservers: readonly string[];
  readonly domain: string;
  readonly ipv4: NetworkIPConfig;
  readonly ipv6: NetworkIPConfig;
  // TODO: new
  readonly name: string;
  readonly cidr: string;
  readonly subnetCidr: string;
}

/**
 * Defines IPv network configuration.
 */
export interface NetworkIPConfig {
  readonly enabled: boolean;
  readonly cidrMask: string;
  readonly gateway: string;
}
