#### Domain setup documentation

Api:

api.awss.ws 

Static website:

stokilo.com

### DEV

Api:

dev.api.awss.ws  
dev.api.awss.ws/v1

Static website:

dev.stokilo.com

### PROD

api.awss.ws
api.awss.ws/v1

stokilo.com


### Cloudflare DNS settings for application

CNAME dev         dev.stokilo.com.s3-website.me-south-1.amazonaws.com
CNAME www.dev     dev.stokilo.com.s3-website.me-south-1.amazonaws.com

CNAME stokilo.com stokilo.com.s3-website.me-south-1.amazonaws.com
CNAME www         stokilo.com.s3-website.me-south-1.amazonaws.com

### Cloudflare DNS settings for image storage

CNAME dev-img     dev-img.stokilo.com.s3-website.me-south-1.amazonaws.com
CNAME prod-img    prod-img.stokilo.com.s3-website.me-south-1.amazonaws.com
