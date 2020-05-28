const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
var requestPromise = require('request-promise');

class NetsuiteRest {
    constructor (options) {
        this.consumer_key = options.consumer_key;
        this.consumer_secret_key = options.consumer_secret_key;
        this.token = options.token;
        this.token_secret = options.token_secret;
        this.version = '1.0';
        this.algorithm = 'HMAC-SHA256';
        this.realm = options.realm;
    }
    getAuthorizationHeader(options) {
        const oauth = OAuth({
            consumer: {
                key: this.consumer_key,
                secret: this.consumer_secret_key,
            },
            realm: this.realm,
            signature_method: this.algorithm,
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha256', key)
                    .update(base_string)
                    .digest('base64')
            },
        })
        return oauth.toHeader(
            oauth.authorize({
                url: options.uri,
                method: options.method
            }, {
                key: this.token,
                secret: this.token_secret,
            })
        )
    }
    request(opts) {
        const {
            url,
            method = 'GET',
            body = ''
        } = opts;
        const options = {
            uri: `https://${this.realm}.suitetalk.api.netsuite.com/services/rest/${url}`,
            method,
            resolveWithFulLResponse: true,
            transform: (body, response) => {
                return {
                        statusCode: response.statusCode,
                        'headers': response.headers,
                        'data': body};
                }
        };
        options.headers = this.getAuthorizationHeader(options);
        if (body)
        {
            options.body = body;       
            options.headers.prefer = "transient";
        }        
        return requestPromise(options);        
    }
}
module.exports = NetsuiteRest;