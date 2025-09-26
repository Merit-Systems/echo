export const WALLET_OWNER = 'echo-fund-owner';
export const WALLET_SMART_ACCOUNT = 'echo-fund-smart-account';

export const DOMAIN_NAME = 'USD Coin';
export const DOMAIN_VERSION = '2';
export const DOMAIN_CHAIN_ID = 8453;

export const TRANSFER_WITH_AUTHORIZATION_NAME = 'TransferWithAuthorization';
export const TRANSFER_WITH_AUTHORIZATION_TYPE = {
    TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
    ]
};