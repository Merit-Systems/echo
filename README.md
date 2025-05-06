# echo

### logs for the lambda

aws logs tail /aws/lambda/sam-app-OpenAILambdaFunction-9xOSmJKc0t2h --follow

## How to deploy (requires aws configure to be setup correctly)

npm run build && sam build && sam deploy

## Update API key

( I couldn't figure out how to do this with the cloudformation template so
this is a hack i employed. )

set your key to OpenAIAPIKey.

aws lambda update-function-configuration --function-name sam-app-OpenAILambdaFunction-9xOSmJKc0t2h --environment "Variables={OPENAI_API_KEY=OpenAIAPIKey}"
