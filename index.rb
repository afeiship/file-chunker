require 'open-uri'
require 'uri'
require 'cgi'
require 'json'
require 'base64'
require "net/http"


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


pwdkey = prelogin_response['servertime'].to_s + "\t" + prelogin_response['nonce'].to_s + "\n" + password.to_s
pub = OpenSSL::PKey::RSA::new
pub.e = 65537
pub.n = OpenSSL::BN.new(prelogin_response['pubkey'],16)
sp = pub.public_encrypt(pwdkey).unpack('H*').first

data = {
  'entry'=> 'weibo',
  'gateway'=>1,
  'from'=> '',
  'savestate'=> 30,
  'useticket'=> 0,
  'pagerefer'=> '',
  'vsnf'=> 1,
  'service'=> 'sso',
  'pwencode'=> 'rsa2',
  'sr'=> '1920 * 1200',
  'encoding'=> 'UTF-8',
  'cdult'=> 3,
  'domain'=> 'sina.com.cn',
  'returntype'=> 'TEXT'
};

data.merge!(prelogin_response).merge!({
    'su'=> su,
    'sp'=> sp,
    'prelt'=> 56
})

login_response = Net::HTTP.post_form(URI(url_login),data)

url_ticket = JSON.parse(login_response.body)['crossDomainUrlList'][0]

weibo_sso_res = Net::HTTP.get_response(URI(url_ticket));

p weibo_sso_res.get_fields('set-cookie')


# puts URI::encode('1290657123@qq.com')