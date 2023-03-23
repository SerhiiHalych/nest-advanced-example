import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ApplicationError } from '../../../../app/errors/application.error';

export class BuildingChatMessageConsumer {
  async sendMessage(externalBuildingId: string, externalContactId: string, text: string): Promise<void> {
    const httpService = new HttpService();

    const foobarCampaignProviderUrl = `${process.env.LIGHTHOUSE_CORE_API_URL}/v1/customer_recommendation`;

    try {
      await firstValueFrom(
        httpService.post(
          foobarCampaignProviderUrl,
          {
            foobarBuildingId: externalBuildingId,
            foobarContactId: externalContactId,
            text: text,
          },
          {
            responseType: 'json',
          }
        )
      );
    } catch (err) {
      throw new ApplicationError(`Error during sending building message to LH Core: ${err}`);
    }
  }
}
