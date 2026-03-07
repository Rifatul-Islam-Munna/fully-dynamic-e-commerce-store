import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SiteSetting } from '../web-settings/entities/site-setting.entity';

type BkashCredentialConfig = {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseUrl: string;
};

type CreateBkashPaymentInput = {
  amount: number;
  payerReference: string;
  callbackUrl: string;
  merchantInvoiceNumber: string;
};

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);
  private accessToken = '';
  private tokenExpiresAt = 0;
  private credentialFingerprint = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(SiteSetting)
    private readonly siteSettingRepository: Repository<SiteSetting>,
  ) {}

  async createPayment(
    input: CreateBkashPaymentInput,
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const config = await this.ensureAccessToken();

    try {
      const response = await lastValueFrom(
        this.httpService.post<Record<string, unknown>>(
          `${config.baseUrl}/create`,
          {
            mode: '0011',
            payerReference: input.payerReference,
            callbackURL: input.callbackUrl,
            amount: this.toMoneyString(input.amount),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: input.merchantInvoiceNumber,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
              'X-App-Key': config.appKey,
            },
          },
        ),
      );

      const data = response.data;
      this.assertBkashSuccess(data, 'creating payment');

      const paymentUrl =
        typeof data.bkashURL === 'string' ? data.bkashURL : undefined;
      const paymentId =
        typeof data.paymentID === 'string' ? data.paymentID : undefined;

      if (!paymentUrl || !paymentId) {
        throw new BadRequestException(
          'bKash payment response did not contain paymentURL or paymentID',
        );
      }

      return {
        paymentUrl,
        paymentId,
      };
    } catch (error) {
      this.logger.error(`Error creating bKash payment: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async executePayment(paymentID: string): Promise<Record<string, unknown>> {
    const config = await this.ensureAccessToken();

    try {
      const response = await lastValueFrom(
        this.httpService.post<Record<string, unknown>>(
          `${config.baseUrl}/execute`,
          { paymentID },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
              'X-App-Key': config.appKey,
            },
          },
        ),
      );

      const data = response.data;
      this.assertBkashSuccess(data, 'executing payment');
      return data;
    } catch (error) {
      this.logger.error(`Error executing bKash payment: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  private async ensureAccessToken() {
    const config = await this.loadBkashConfigOrThrow();
    const nextFingerprint = this.buildCredentialFingerprint(config);

    if (nextFingerprint !== this.credentialFingerprint) {
      this.credentialFingerprint = nextFingerprint;
      this.accessToken = '';
      this.tokenExpiresAt = 0;
    }

    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.requestAccessToken(config);
    }

    return config;
  }

  private async requestAccessToken(config: BkashCredentialConfig) {
    try {
      const response = await lastValueFrom(
        this.httpService.post<Record<string, unknown>>(
          `${config.baseUrl}/token/grant`,
          {
            app_key: config.appKey,
            app_secret: config.appSecret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              username: config.username,
              password: config.password,
            },
          },
        ),
      );

      const data = response.data;
      this.assertBkashSuccess(data, 'granting access token');

      const accessToken =
        typeof data.id_token === 'string' ? data.id_token : undefined;
      const expiresInSeconds = Number(data.expires_in);

      if (!accessToken) {
        throw new BadRequestException(
          'bKash token response did not return id_token',
        );
      }

      if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
        throw new BadRequestException(
          'bKash token response returned an invalid expires_in value',
        );
      }

      this.accessToken = accessToken;
      this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
    } catch (error) {
      this.logger.error(`Error fetching bKash token: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  private async loadBkashConfigOrThrow(): Promise<BkashCredentialConfig> {
    const siteSetting = await this.siteSettingRepository
      .createQueryBuilder('site')
      .addSelect([
        'site.bkashAppKey',
        'site.bkashAppSecret',
        'site.bkashUsername',
        'site.bkashPassword',
      ])
      .where('site.key = :key', { key: 'default' })
      .andWhere('site.isActive = true')
      .orderBy('site.updatedAt', 'DESC')
      .getOne();

    const appKey = siteSetting?.bkashAppKey?.trim();
    const appSecret = siteSetting?.bkashAppSecret?.trim();
    const username = siteSetting?.bkashUsername?.trim();
    const password = siteSetting?.bkashPassword?.trim();
    const baseUrl = this.configService.get<string>('BKASH_BASE_URL')?.trim();

    if (!appKey || !appSecret || !username || !password) {
      throw new BadRequestException(
        'bKash credentials are not configured in site settings',
      );
    }

    if (!baseUrl) {
      throw new BadRequestException('BKASH_BASE_URL is not configured');
    }

    return {
      appKey,
      appSecret,
      username,
      password,
      baseUrl,
    };
  }

  private assertBkashSuccess(
    data: Record<string, unknown>,
    action: string,
  ) {
    const statusCode =
      typeof data.statusCode === 'string' ? data.statusCode : undefined;

    if (statusCode && statusCode !== '0000') {
      const statusMessage =
        typeof data.statusMessage === 'string'
          ? data.statusMessage
          : 'Unknown error';
      throw new BadRequestException(
        `bKash failed while ${action}: ${statusMessage}`,
      );
    }
  }

  private buildCredentialFingerprint(config: BkashCredentialConfig) {
    return [
      config.appKey,
      config.appSecret,
      config.username,
      config.password,
      config.baseUrl,
    ].join('|');
  }

  private toMoneyString(value: number) {
    return this.roundCurrency(value).toFixed(2);
  }

  private roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (typeof error === 'object' && error && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } })
        .response;
      const message = response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return 'Unknown error';
  }
}
