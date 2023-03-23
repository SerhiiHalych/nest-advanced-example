/* eslint-disable @typescript-eslint/naming-convention */
import type { Message, Subscription, Topic } from '@google-cloud/pubsub';
import { PubSub } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import PQueue = require('p-queue');

import { CommandHandlerType } from '../../../../common/diTokens';
import type { IHandleGettingOfIncomingEmailCommandHandler } from '../../application/commands/handleGettingOfIncomingEmail/IHandleGettingOfIncomingEmailCommandHandler';

@Injectable()
export class CommunicationGooglePubSub {
  private pubsub: PubSub;

  constructor(private moduleRef: ModuleRef) {
    this.pubsub = new PubSub({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        type: 'service_account',
        private_key: process.env.GOOGLE_CLOUD_CLIENT_PRIVATE_KEY?.split('\\n').join('\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
      },
    });
  }

  async subscribeToNewEmails(): Promise<void> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const topicName = process.env.GOOGLE_CLOUD_GMAIL_UNREAD_TOPIC_NAME;
    const subscriptionName = process.env.GOOGLE_CLOUD_GMAIL_UNREAD_TOPIC_SUBSCRIPTION_NAME;
    const topicId = `projects/${projectId}/topics/${topicName}`;
    const subscriptionId = `projects/${projectId}/subscriptions/${subscriptionName}`;

    const topic = await this.setupTopic(topicId);

    await this.setupTopicIam(topic);

    const subscription = await this.setupSubscription(subscriptionId, topic);

    if (subscription.listenerCount('message') > 0) {
      return;
    }

    const queue = new PQueue.default({ concurrency: 1 });

    subscription.on('message', async (message: Message) => {
      queue.add(async () => {
        const handleGettingOfIncomingEmailCommandHandler =
          await this.moduleRef.resolve<IHandleGettingOfIncomingEmailCommandHandler>(
            CommandHandlerType.HANDLE_GETTING_OF_INCOMING_EMAIL,
            undefined
          );

        await handleGettingOfIncomingEmailCommandHandler.execute({ message });
      });
    });

    subscription.on('error', error => {
      // eslint-disable-next-line no-console
      console.error('Google PubSub subscription error:', error);
    });
  }

  private async setupTopic(topicId: string): Promise<Topic> {
    const [topics] = await this.pubsub.getTopics();
    let topic = topics.find(({ name }) => name === topicId);

    if (!topic) {
      const [createdTopic] = await this.pubsub.createTopic({
        name: topicId,
      });

      console.log(`Pubsub topic ${topicId} created`);

      topic = createdTopic;
    }

    return topic;
  }

  private async setupTopicIam(topic: Topic): Promise<void> {
    const [policy] = await topic.iam.getPolicy();

    const roleForGmailPublisher = 'roles/pubsub.publisher';
    const gmailPublisherMember = 'serviceAccount:gmail-api-push@system.gserviceaccount.com';

    const publisherBinging = policy.bindings.find(({ role }) => role === roleForGmailPublisher);
    const publisherBingingMembers = publisherBinging?.members ?? [];

    if (!publisherBingingMembers.includes(gmailPublisherMember)) {
      await topic.iam.setPolicy({
        bindings: [
          {
            role: roleForGmailPublisher,
            members: [...publisherBingingMembers, gmailPublisherMember],
          },
        ],
      });

      console.log(`Pubsub policy updated for gmail api push email`);
    }
  }

  private async setupSubscription(subscriptionId: string, topic: Topic): Promise<Subscription> {
    const [subscriptions] = await topic.getSubscriptions();

    let subscription = subscriptions.find(({ name }) => name === subscriptionId);

    if (!subscription) {
      const [createdSubscription] = await topic.createSubscription(subscriptionId);

      console.log(`Pubsub subscription ${subscriptionId} created`);

      subscription = createdSubscription;
    }

    return subscription;
  }
}
