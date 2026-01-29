  import { TInboundMessage, TOutboundMessage } from "./"
  export type TMessage = TOutboundMessage | TInboundMessage

  export type TOutboundMessageType = TOutboundMessage['type']
  export type TInboundMessageType = TInboundMessage['type']