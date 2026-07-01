export interface IMomoCredentials {
  access_key: string;
  secret_key: string;
  partner_code: string;
  partner_name?: string;
  store_id?: string;
  store_name?: string;

  momo_url: string;
  redirect_url: string;
  ipn_url: string;
}
