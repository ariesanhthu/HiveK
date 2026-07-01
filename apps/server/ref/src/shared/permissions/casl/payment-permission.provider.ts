import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BasePermissionProvider } from '@sgod-casl/library';

/**
 * Loads payment permission rules from JSON into {@link BasePermissionProvider}
 * (same catalog consumed by Auth for JWT permission ids).
 */
@Injectable()
export class PaymentPermissionProvider extends BasePermissionProvider implements OnModuleInit {
	private readonly logger = new Logger(PaymentPermissionProvider.name);

	onModuleInit(): void {
		console.log('Load payment permission');
		const paths = this.resolvePermissionFilePaths();
		if (paths.length === 0) {
			this.logger.warn('No payment permission JSON files found; CASL will deny by default.');
			return;
		}
		this.loadFromFiles(paths);
		this.logger.log(
			`Loaded ${this.findAll().length} payment permission rules from ${paths.length} file(s).`
		);
	}

	private resolvePermissionFilePaths(): string[] {
		const projectRoot = process.cwd();
		const possibleDirs = [
			path.join(projectRoot, 'src', 'infrastructure', 'config', 'permissions'),
			path.join(projectRoot, 'dist', 'infrastructure', 'config', 'permissions'),
			path.join(__dirname, '../../../infrastructure/config/permissions'),
		];

		let dataDir: string | null = null;
		for (const dir of possibleDirs) {
			if (fs.existsSync(dir)) {
				dataDir = dir;
				break;
			}
		}
		if (!dataDir) {
			return [];
		}

		const sgod = path.join(dataDir, 'payment-sgod.permissions.json');
		const enterprise = path.join(dataDir, 'payment-enterprise.permissions.json');
		const guest = path.join(dataDir, 'payment-guest.permissions.json');
		return [sgod, enterprise, guest].filter((p) => fs.existsSync(p));
	}
}
