from services.url_predictor import predict_url

tests = [
    "https://google.com",
    "https://amazon.in",
    "http://amazon-login-security.xyz/login",
    "https://bit.ly/test123",
    "http://192.168.1.10/login",
    "https://github.com"
]

for url in tests:
    print("=" * 60)
    print(predict_url(url))