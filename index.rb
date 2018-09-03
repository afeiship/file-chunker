require 'open-uri'

url_prelogin = 'https://login.sina.com.cn/sso/prelogin.php'
url_login = 'https://login.sina.com.cn/sso/login.php'

prelogin_data = {
    entry: 'sso',
    callback: 'sinaSSOController.preloginCallBack',
    su: ''
}

res = open(url_prelogin)
puts res.read