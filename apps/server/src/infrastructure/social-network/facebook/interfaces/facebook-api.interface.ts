export interface IFacebookOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface IFacebookPageAccount {
  access_token: string;
  category: string;
  category_list: Array<{ id: string; name: string }>;
  name: string;
  id: string;
  tasks: string[];
}

export interface IFacebookPageAccountsResponse {
  data: IFacebookPageAccount[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface IFacebookPageDetails {
  id: string;
  name: string;
  access_token: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
  fan_count?: number;
}

export interface IFacebookPostResponse {
  id: string;
}
