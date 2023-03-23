export interface ISegmentService {
  alias(data: { oldId: string; newId: string }): Promise<void>;

  identify(data: { userId?: string; anonymousId?: string; traits: any }): Promise<void>;

  track<TEventProperties>(data: {
    userId?: string;
    anonymousId?: string;
    event: string;
    properties: TEventProperties;
  }): Promise<void>;
}
