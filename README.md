# echo

### logs for the lambda

aws logs tail /aws/lambda/sam-app-OpenAILambdaFunction-9xOSmJKc0t2h --follow

## How to deploy (requires aws configure to be setup correctly)

npm run build && sam build && sam deploy
