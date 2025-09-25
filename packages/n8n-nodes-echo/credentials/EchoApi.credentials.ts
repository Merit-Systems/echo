import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EchoApi implements ICredentialType {
	name = 'echoApi';
	displayName = 'Echo API';
	documentationUrl = 'https://echo.merit.systems/app/1cf92670-39b3-422f-8a9f-86ee7bee5556/keys?generate=true';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Get your API key at https://echo.merit.systems/app/1cf92670-39b3-422f-8a9f-86ee7bee5556/keys?generate=true',
		},
		{
			displayName: 'App ID',
			name: 'appId',
			type: 'string',
			default: '1cf92670-39b3-422f-8a9f-86ee7bee5556',
			required: false,
			description: 'The Echo App ID for your application',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://echo.router.merit.systems',
			required: false,
			description: 'The base URL for the Echo API (default: https://echo.router.merit.systems)',
		},
	];
}