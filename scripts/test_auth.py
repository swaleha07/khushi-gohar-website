import urllib.request
import urllib.parse
import json
import time

BASE = 'http://localhost:3000'

def request(path, data=None, headers=None, method=None):
    url = f'{BASE}{path}'
    req_headers = {'Content-Type': 'application/json'}
    if headers:
        req_headers.update(headers)
    req_data = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read().decode('utf-8')
            return res.status, json.loads(body) if body else {}, res.headers
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body) if body else {}, e.headers
        except Exception:
            return e.code, {'raw': body}, e.headers

def run_all_tests():
    print('[*] KHUSHI BEAUTY MOBILE OTP AUTHENTICATION TEST SUITE')
    print('========================================================')

    # Test 1: Send OTP to Existing User (Login)
    print('\n[1] TEST: Send OTP to Existing User (Login)')
    status, res, _ = request('/api/auth/send-otp', {'phone': '9876543210', 'countryCode': '+91', 'mode': 'login'})
    print(f'Status: {status}, Response: {res}')
    assert status == 200, f'Expected 200, got {status}'
    assert 'devOtp' in res, 'Expected devOtp in development mode'
    login_otp = res['devOtp']

    # Test 2: Rate limit cooldown on immediate resend
    print('\n[2] TEST: Rate Limit Cooldown Protection (< 60s)')
    status, res, _ = request('/api/auth/send-otp', {'phone': '9876543210', 'countryCode': '+91', 'mode': 'login'})
    print(f'Status: {status}, Error: {res.get("error")}, Cooldown: {res.get("cooldownRemaining")}s')
    assert status == 429, f'Expected 429 for immediate resend, got {status}'

    # Test 3: Wrong OTP test (decrements attempt counter)
    print('\n[3] TEST: Incorrect OTP Handling')
    status, res, _ = request('/api/auth/verify-otp', {'phone': '9876543210', 'countryCode': '+91', 'otp': '000000'})
    print(f'Status: {status}, Error: {res.get("error")}, Remaining: {res.get("remainingAttempts")}')
    assert status == 400, f'Expected 400, got {status}'
    assert res.get('error') == 'INCORRECT'
    assert res.get('remainingAttempts') == 2

    # Test 4: Verify OTP and Login Existing User
    print('\n[4] TEST: Successful OTP Verification & Login (Existing User)')
    status, res, headers = request('/api/auth/verify-otp', {'phone': '9876543210', 'countryCode': '+91', 'otp': login_otp})
    print(f'Status: {status}, User: {res.get("user", {}).get("name")}, Phone: {res.get("user", {}).get("phone")}')
    assert status == 200
    assert res['user']['name'] == 'Aarohi Sen'
    auth_token = res['token']

    # Test 5: Fetch Profile via /api/auth/me
    print('\n[5] TEST: Verify Profile via /api/auth/me (Session Token)')
    status, res, _ = request('/api/auth/me', headers={'Authorization': f'Bearer {auth_token}'})
    print(f'Status: {status}, User Phone: {res.get("user", {}).get("phone")}, Saved Addresses: {len(res.get("user", {}).get("savedAddresses", []))}')
    assert status == 200
    assert res['user']['phone'] == '+919876543210'

    # Test 6: Sign Up Flow for New User (Mobile-Only)
    new_phone = f'98{int(time.time()) % 100000000:08d}'
    print(f'\n[6] TEST: New User Mobile-Only Registration ({new_phone})')
    status, res, _ = request('/api/auth/send-otp', {'phone': new_phone, 'countryCode': '+91', 'mode': 'signup'})
    print(f'Send OTP New User: Status: {status}, devOtp: {res.get("devOtp")}')
    assert status == 200
    new_otp = res['devOtp']

    status, res, _ = request('/api/auth/verify-otp', {
        'phone': new_phone,
        'countryCode': '+91',
        'otp': new_otp,
        'name': 'Khushi Radiant Glow'
    })
    print(f'Verify New User: Status: {status}, isNewUser: {res.get("isNewUser")}, Name: {res.get("user", {}).get("name")}')
    assert status == 200
    assert res['isNewUser'] is True
    assert res['user']['name'] == 'Khushi Radiant Glow'
    new_user_token = res['token']

    # Test 7: Add Saved Address (No Email required)
    print('\n[7] TEST: Saved Address Management (Mobile-Only Account)')
    status, res, _ = request('/api/auth/profile', {
        'action': 'add_address',
        'address': {
            'fullName': 'Khushi Radiant Glow',
            'phone': new_phone,
            'address': 'Plot 88, Rose Petal Avenue',
            'landmark': 'Near Lotus Botanical Gardens',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'pincode': '400001',
            'country': 'India',
            'isDefault': True
        }
    }, headers={'Authorization': f'Bearer {new_user_token}'})
    print(f'Add Address: Status: {status}, Saved Addresses Count: {len(res.get("user", {}).get("savedAddresses", []))}')
    assert status == 200
    assert len(res['user']['savedAddresses']) == 1

    # Test 8: Logout Endpoint
    print('\n[8] TEST: User Logout')
    status, res, _ = request('/api/auth/logout', method='POST')
    print(f'Logout: Status: {status}, Message: {res.get("message")}')
    assert status == 200

    # Test 9: Unregistered Phone Rejection during Login with Suggestion
    print('\n[9] TEST: Unregistered Phone Handling during Login')
    status, res, _ = request('/api/auth/send-otp', {'phone': '9111122222', 'countryCode': '+91', 'mode': 'login'})
    print(f'Status: {status}, Error: {res.get("error")}, SuggestSignup: {res.get("suggestSignup")}')
    assert status == 404
    assert res.get('suggestSignup') is True

    print('\n========================================================')
    print('SUCCESS: ALL 9 AUTHENTICATION & SECURITY TESTS PASSED!')
    print('========================================================')

if __name__ == '__main__':
    run_all_tests()
