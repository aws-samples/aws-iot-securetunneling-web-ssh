import {Construct, Stack, StackProps, CfnOutput, Duration, Aws} from '@aws-cdk/core'
import { LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway"
import { CfnIdentityPool, CfnUserPool, CfnUserPoolUser, UserPool, UserPoolClient } from "@aws-cdk/aws-cognito"
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "@aws-cdk/custom-resources"
import { Code, Runtime, Function } from "@aws-cdk/aws-lambda"
import {Parameters} from '../parameters'

export class CdkWebSshStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // COGNITO USER POOL
    const user_pool = new UserPool(this, 'UserPool', {
        passwordPolicy: {
            minLength: 6,
            requireDigits: false,
            requireLowercase: false,
            requireSymbols: false,
            requireUppercase: false
          }
    })
    const cfn_user_pool = user_pool.node.defaultChild as CfnUserPool 
    cfn_user_pool.adminCreateUserConfig = {allowAdminCreateUserOnly: true}
    new CfnOutput(this, 'UserPoolId', {
      value: user_pool.userPoolId
    })

    // COGNITO USER POOL WEB CLIENT
    const user_pool_client = new UserPoolClient(this, 'UserPoolClient', {
      userPool: user_pool,
      generateSecret: false,
      authFlows: {
        userSrp: true,
        adminUserPassword: true
      } 
    })
    new CfnOutput(this, 'UserPoolWebClientId', {
      value: user_pool_client.userPoolClientId
    })


    // COGNITO IDENTITY POOL
    const user_pool_identity = new CfnIdentityPool(this, 'UserPoolIdentity', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: user_pool_client.userPoolClientId, 
        providerName: user_pool.userPoolProviderName
        }]
    })

    new CfnOutput(this, 'UserPoolIdentityId', {
      value: user_pool_identity.ref
    })

    // COGNITO USER ADMIN 
    const user_pool_user = new CfnUserPoolUser(this, 'UserPoolUser', {
      userPoolId: user_pool.userPoolId,
      username: Parameters.cognito_username
    })

    // FORCE USER PASSWORD 
    const force_user_password = new AwsCustomResource(this, 'CognitoForceUserPassword', {
      onCreate: {
          service: 'CognitoIdentityServiceProvider' ,
          action: 'adminSetUserPassword',
          parameters: {
              Password: Parameters.cognito_password,
              UserPoolId: user_pool.userPoolId,
              Username: Parameters.cognito_username,
              Permanent: true
          },
          physicalResourceId: PhysicalResourceId.of(user_pool_user.userPoolId)
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE})
  })


    // LAMBDA THAT SETS COOKIE
    const lambda_set_cookie_path = `${__dirname}/lambda/setCookie`
    const lambda_set_cookie = new Function(this, 'LambdaSetCookie', {
        runtime: Runtime.NODEJS_12_X,
        code: Code.fromAsset(lambda_set_cookie_path),
        handler: 'index.handler',
        timeout: Duration.seconds(15)  
    })

    // LAMBDA FOR CORS
    const lambda_cors_path = `${__dirname}/lambda/cors`
    const lambda_cors= new Function(this, 'LambdaCors', {
        runtime: Runtime.NODEJS_12_X,
        code: Code.fromAsset(lambda_cors_path),
        handler: 'index.handler',
        timeout: Duration.seconds(15)  
    })


    // API THAT SETS COOKIE 
    const api = new RestApi(this, 'ApiCookie')
    const integration_set_cookie = new LambdaIntegration(lambda_set_cookie)
    api.root.addMethod('POST', integration_set_cookie, {apiKeyRequired: false})
    const integration_cors = new LambdaIntegration(lambda_cors)
    api.root.addMethod('OPTIONS', integration_cors, {apiKeyRequired: false})

    new CfnOutput(this, 'ApiCookieUrl', {
      value: api.url
    })


    new CfnOutput(this, 'AwsRegion', {
      value: Aws.REGION
    })

  }
}
