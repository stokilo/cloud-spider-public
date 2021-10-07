#### What is it?

Cloud spider real estate application. Sample serverless application implemented using serverless stack and NuxtJs.

Project configure domains for API (awss.ws) and web app (stokilo.com). These domains are configured for DEV and PROD
environments with subdomains:

dev.stokilo.com (DEV) -> dev.api.awss.ws 

stokilo.com (PROD) -> api.awss.ws.


VPN connection profile domain is set to vpn.awss.ws (CNAME must be updated manually with VPN endpoint value after CDK deployment).
This project is only demonstration and domains are hardcoded in IaC code and client config. You can however replace
them and use own domains. It is possible to bootstrap whole stack in 10 minutes (DynamoDb, VPC, VPN, OpenSearch,
S3 ...). Monthly cost for running this stack is around 120$ .

https://youtu.be/32n90gxumhc


![Alt Text](doc/assets/img/1.gif)
![Alt Text](doc/assets/img/2.gif)
![Alt Text](doc/assets/img/3.gif)

#### Preparation

1. You need S3 bucket with name that match your domain. CDK will try to create one but it is better to check if name
is available. Buckets must be publically accessible.

Create new website in the Cloudflare admin panel. For example

   stokilo.com

   Add two records to the DNS settings to static websites. Provide s3 bucket url for CNAME values.

```
CNAME: www.stokilo.com -> stokilo.com.s3-website.me-south-1.amazonaws.com
CNAME: stokilo.com     -> stokilo.com.s3-website.me-south-1.amazonaws.com
 
CNAME: www.dev.stokilo.com     -> dev.stokilo.com.s3-website.me-south-1.amazonaws.com
CNAME: dev.stokilo.com         -> dev.stokilo.com.s3-website.me-south-1.amazonaws.com
```


2. Copy template.env to .env file. Exclude it from git. Fill all values.

   Create developer applications for facebook and google, copy client and secret ids to env files.
 
   For example Facebook setup values I'm using my API domain that is provisioned with CDK using IaC from this project.
   My API domain name is awss.ws

```
App Domains
api.awss.ws
api.awss.ws/v1
```   

```
Website -> Valid OAuth Redirect URIs
https://api.awss.ws/v1/authenticate/oauth-step1
``` 

Update constants.js for frontend app.

3. Check lib/vpn.md to setup OpenVpn connection to the VPC

4. Once connected install awscurl and check system status

```
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=status --region me-south-1
```

Dry run migration 0.0.1 number 2
```
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=migrate\&version\=0.0.1\&orderNr\=2\&dryRun\=true  --region me-south-1
```

Migrate to 0.0.1 number 1 then number 2
```
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=migrate\&version\=0.0.1\&orderNr\=1  --region me-south-1
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=migrate\&version\=0.0.1\&orderNr\=2  --region me-south-1
```

#### Build

```
Start by installing the dependencies.
```bash
$ yarn install
```

#### Production deployment 
```bash
$ yarn deploy --stage prod
```

#### Development with live lambda reload

```bash
$ yarn start
```

#### Run unit and integration tests

```bash
$ yarn test
$ yarn integ-test
```

#### Frontend (localhost:3000)
```bash
$ cd frontend
$ yarn install
$ yarn run dev
```
