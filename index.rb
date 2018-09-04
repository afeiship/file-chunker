require 'open-uri'
require 'uri'
require 'cgi'
require 'json'
require 'base64'

# url login:
url_prelogin = 'https://login.sina.com.cn/sso/prelogin.php'
url_login = 'https://login.sina.com.cn/sso/login.php'

# prepare data:
config = JSON.parse(File.read './config.json')
username = config['username'];
password = config['password'];
su = Base64.strict_encode64(username.sub("@","%40"))

# regexp
PRELOGIN_JSONP_RE = /{(.*)}/;

prelogin_data = {
    entry: 'sso',
    callback: 'sinaSSOController.preloginCallBack',
    su: su,
    rsakt:'mod',
    client: 'ssologin.js(v1.4.15)',
    _: Time.now.to_i.to_s
};

## prelogin:
res = open( "#{url_prelogin}?#{URI.encode_www_form(prelogin_data)}" )
prelogin_response = JSON.parse PRELOGIN_JSONP_RE.match(res.read)[0];


# puts prelogin_response.class
# puts prelogin_response.match(/"\{(.*)\}"/)


pwdkey = prelogin_response['servertime'].to_s + "\t" + prelogin_response['nonce'].to_s + "\n" + password.to_s
pub = OpenSSL::PKey::RSA::new
pub.e = 65537
pub.n = OpenSSL::BN.new(prelogin_response['pubkey'],16)
sp = pub.public_encrypt(pwdkey).unpack('H*').first

p sp


# puts URI::encode('1290657123@qq.com')