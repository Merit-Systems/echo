import { OAuth2Config, OIDCConfig } from 'next-auth/providers';

// the type parameter of the provider doesnt matter to us, so I am ignoring it.
// the alternative is to enumerate each provider's profile type.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type OAuthProvider = OAuth2Config<any> | OIDCConfig<any>;
