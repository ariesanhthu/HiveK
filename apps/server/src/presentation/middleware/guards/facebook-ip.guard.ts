import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

@Injectable()
export class FacebookIpGuard implements CanActivate {
  private readonly logger = new Logger(FacebookIpGuard.name);
  private readonly isGuardEnabled: boolean;
  private readonly allowedCidrs: string[];

  // Meta's default published IP CIDR ranges for webhooks
  private readonly defaultMetaCidrs = [
    '173.252.64.0/18',
    '69.63.176.0/20',
    '66.220.144.0/20',
    '69.171.224.0/19',
    '173.252.96.0/19',
    '31.13.24.0/21',
    '31.13.64.0/18',
    '45.64.40.0/22',
    '103.4.96.0/22',
    '129.134.0.0/17',
    '157.240.0.0/16',
    '179.60.192.0/22',
    '185.60.216.0/22',
    '204.15.20.0/22',
    // Local / private ranges for development convenience
    '127.0.0.1/32',
    '::1/128',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ];

  constructor(private readonly configService: ConfigService) {
    this.isGuardEnabled = this.configService.get<boolean>('FACEBOOK_WEBHOOK_IP_GUARD', false);
    const customIps = this.configService.get<string>('FACEBOOK_WEBHOOK_ALLOWED_IPS');
    
    if (customIps) {
      this.allowedCidrs = customIps.split(',').map((ip) => ip.trim());
    } else {
      this.allowedCidrs = this.defaultMetaCidrs;
    }
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.isGuardEnabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Resolve client IP (supporting reverse proxies)
    const clientIp = request.headers['x-forwarded-for']
      ? (request.headers['x-forwarded-for'] as string).split(',')[0].trim()
      : request.socket.remoteAddress || request.ip;

    if (!clientIp) {
      this.logger.warn('Blocked webhook request: Unable to resolve client IP.');
      return false;
    }

    const cleanIp = this.cleanIpAddress(clientIp);
    const isAllowed = this.ipMatchesAnyCidr(cleanIp, this.allowedCidrs);

    if (!isAllowed) {
      this.logger.warn(`Blocked webhook request: IP ${cleanIp} is not in Meta's whitelisted subnets.`);
    }

    return isAllowed;
  }

  private cleanIpAddress(ip: string): string {
    // Map IPv4-mapped IPv6 address (e.g. ::ffff:127.0.0.1) to clean IPv4
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }

  private ipMatchesAnyCidr(ip: string, cidrs: string[]): boolean {
    const isIpv6 = net.isIPv6(ip);
    
    for (const cidr of cidrs) {
      try {
        const [range, bitsStr] = cidr.split('/');
        const isRangeIpv6 = net.isIPv6(range);

        // IP types must match for subnet checking
        if (isIpv6 !== isRangeIpv6) {
          continue;
        }

        const bits = bitsStr ? parseInt(bitsStr, 10) : (isIpv6 ? 128 : 32);

        if (isIpv6) {
          if (this.matchIpv6(ip, range, bits)) return true;
        } else {
          if (this.matchIpv4(ip, range, bits)) return true;
        }
      } catch (err: any) {
        this.logger.error(`Error parsing CIDR range "${cidr}": ${err.message}`);
      }
    }
    return false;
  }

  private matchIpv4(ip: string, range: string, bits: number): boolean {
    const ipNum = this.ipv4ToNumber(ip);
    const rangeNum = this.ipv4ToNumber(range);
    
    if (bits === 0) return true;
    const mask = ~( (1 << (32 - bits)) - 1 );
    return (ipNum & mask) === (rangeNum & mask);
  }

  private ipv4ToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  private matchIpv6(ip: string, range: string, bits: number): boolean {
    if (bits === 0) return true;

    const ipParts = this.ipv6To16BitWords(ip);
    const rangeParts = this.ipv6To16BitWords(range);

    let bitsLeft = bits;
    for (let i = 0; i < 8; i++) {
      if (bitsLeft <= 0) break;
      
      const checkBits = Math.min(bitsLeft, 16);
      const mask = (0xffff << (16 - checkBits)) & 0xffff;
      
      if ((ipParts[i] & mask) !== (rangeParts[i] & mask)) {
        return false;
      }
      
      bitsLeft -= 16;
    }
    return true;
  }

  private ipv6To16BitWords(ip: string): number[] {
    // Basic IPv6 expansion (handles zero compression ::)
    const expanded = this.expandIpv6(ip);
    return expanded.split(':').map((part) => parseInt(part, 16));
  }

  private expandIpv6(ip: string): string {
    const parts = ip.split('::');
    if (parts.length > 2) throw new Error('Invalid IPv6 address');

    let left = parts[0] ? parts[0].split(':') : [];
    let right = parts[1] ? parts[1].split(':') : [];

    const missingCount = 8 - (left.length + right.length);
    const middle = Array(missingCount).fill('0000');

    left = left.map((p) => p.padStart(4, '0'));
    right = right.map((p) => p.padStart(4, '0'));

    return [...left, ...middle, ...right].join(':');
  }
}
