export interface IMomoRawSignatureCreate {
  accessKey: string;
  amount: number;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}

export interface IMomoRawSignatureConfirm {
  accessKey: string;
  amount: number;
  description: string;
  orderId: string;
  partnerCode: string;
  requestId: string;
  requestType: string;
}

export interface IMomoRawSignatureRefund {
  accessKey: string;
  amount: number;
  description: string;
  orderId: string;
  partnerCode: string;
  requestId: string;
  transId: number;
}

export interface IMomoRawSignatureWebhook {
  //accessKey=$accessKey&amount=$amount&extraData=$extraData
  //&message=$message&orderId=$orderId&orderInfo=$orderInfo
  //&orderType=$orderType&partnerCode=$partnerCode&payType=
  // $payType&requestId=$requestId&responseTime=
  // $responseTime&resultCode=$resultCode&transId=$transId
  accessKey: string;
  amount: number;
  extraData: string;
  message: string;
  orderId: string;
  orderInfo: string;
  orderType: string;
  partnerCode: string;
  payType: string;
  requestId: string;
  responseTime: number;
  resultCode: number;
  transId: number;
}

// accessKey=$accessKey&amount=$amount&extraData=$extraData
// &ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo
// &partnerClientId=$partnerClientId&partnerCode=
// $partnerCode&redirectUrl=$redirectUrl&requestId=
// $requestId&requestType=$requestType
export interface IMomoRawSignatureCreateWithSubscription {
  accessKey: string;
  amount: number;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerClientId: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}

//accessKey=$accessKey&amount=$amount&callbackToken=
// $callbackToken&extraData=$extraData&message=$message
// &orderId=$orderId&orderInfo=$orderInfo&orderType=
// $orderType&partnerClientId=$partnerClientId
// &partnerCode=$partnerCode&payType=$payType&requestId=
// $requestId&responseTime=$responseTime&resultCode=
// $resultCode&transId=$transId
export interface IMomoRawSignatureCreateWithSubscriptionWebhook {
  accessKey: string;
  amount: number;
  callbackToken: string;
  extraData: string;
  message: string;
  orderId: string;
  orderInfo: string;
  orderType: string;
  partnerClientId: string;
  partnerCode: string;
  payType: string;
  requestId: string;
  responseTime: number;
  resultCode: number;
  transId: number;
}

// accessKey=$accessKey&callbackToken=$callbackToken&orderId=
// $orderId&partnerClientId=$partnerClientId&partnerCode=
// $partnerCode&requestId=$requestId
export interface IMomoRawSignatureCreateSubscription {
  accessKey: string;
  callbackToken: string;
  orderId: string;
  partnerClientId: string;
  partnerCode: string;
  requestId: string;
}
