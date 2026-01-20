import requests
import sys
from datetime import datetime
import json

class BeatsMarketplaceAPITester:
    def __init__(self, base_url="https://music-marketplace-22.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def test_beats_api(self):
        """Test /api/beats endpoint"""
        try:
            response = requests.get(f"{self.api_url}/beats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'beats' in data and isinstance(data['beats'], list):
                    beats_count = len(data['beats'])
                    self.log_test(f"GET /api/beats (Found {beats_count} beats)", True)
                    
                    # Print first beat details for debugging
                    if beats_count > 0:
                        first_beat = data['beats'][0]
                        print(f"   First beat details:")
                        print(f"   - beat_id: {first_beat.get('beat_id')}")
                        print(f"   - audio_filename: {first_beat.get('audio_filename')}")
                        print(f"   - cover_filename: {first_beat.get('cover_filename')}")
                        print(f"   - audio_url: {first_beat.get('audio_url')}")
                        print(f"   - cover_url: {first_beat.get('cover_url')}")
                    
                    return data['beats']
                else:
                    self.log_test("GET /api/beats", False, "Response missing 'beats' array")
                    return []
            else:
                self.log_test("GET /api/beats", False, f"HTTP {response.status_code}", 200, response.status_code)
                return []
        except Exception as e:
            self.log_test("GET /api/beats", False, f"Exception: {str(e)}")
            return []

    def test_beat_audio_access(self, beats):
        """Test audio file access"""
        if not beats:
            self.log_test("Audio file access", False, "No beats available to test")
            return
        
        # Test first beat's audio
        beat = beats[0]
        # Extract filename from audio_url if available, otherwise use audio_filename
        audio_url = beat.get('audio_url', '')
        if audio_url:
            audio_filename = audio_url.split('/')[-1]  # Get filename from URL
        else:
            audio_filename = beat.get('audio_filename') or f"{beat.get('beat_id', 'test')}.mp3"
        
        try:
            # Try GET with range header to avoid downloading full file
            headers = {'Range': 'bytes=0-1023'}
            response = requests.get(f"{self.api_url}/beats/audio/{audio_filename}", headers=headers, timeout=10)
            if response.status_code in [200, 206]:  # 206 = Partial Content
                self.log_test(f"Audio access: {audio_filename}", True)
            else:
                self.log_test(f"Audio access: {audio_filename}", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test(f"Audio access: {audio_filename}", False, f"Exception: {str(e)}")

    def test_beat_cover_access(self, beats):
        """Test cover image access"""
        if not beats:
            self.log_test("Cover image access", False, "No beats available to test")
            return
        
        # Test first beat's cover
        beat = beats[0]
        cover_filename = beat.get('cover_filename') or f"{beat.get('beat_id', 'test')}.jpg"
        
        try:
            # Try GET with range header to avoid downloading full file
            headers = {'Range': 'bytes=0-1023'}
            response = requests.get(f"{self.api_url}/beats/cover/{cover_filename}", headers=headers, timeout=10)
            if response.status_code in [200, 206]:  # 206 = Partial Content
                self.log_test(f"Cover access: {cover_filename}", True)
            else:
                self.log_test(f"Cover access: {cover_filename}", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test(f"Cover access: {cover_filename}", False, f"Exception: {str(e)}")

    def test_stripe_config(self):
        """Test Stripe configuration endpoint"""
        try:
            response = requests.get(f"{self.api_url}/payment/config", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'publishable_key' in data and data['publishable_key']:
                    if data['publishable_key'].startswith('pk_test_'):
                        self.log_test("Stripe config endpoint", True, f"Publishable key: {data['publishable_key'][:20]}...")
                    else:
                        self.log_test("Stripe config endpoint", False, "Invalid publishable key format")
                else:
                    self.log_test("Stripe config endpoint", False, "Missing publishable_key in response")
            else:
                self.log_test("Stripe config endpoint", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test("Stripe config endpoint", False, f"Exception: {str(e)}")

    def test_paypal_config(self):
        """Test PayPal configuration endpoint"""
        try:
            response = requests.get(f"{self.api_url}/payment/paypal/config", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'client_id' in data and data['client_id']:
                    self.log_test("PayPal config endpoint", True, f"Client ID: {data['client_id'][:20]}...")
                else:
                    self.log_test("PayPal config endpoint", False, "Missing client_id in response")
            else:
                self.log_test("PayPal config endpoint", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test("PayPal config endpoint", False, f"Exception: {str(e)}")

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        endpoints = [
            ("/", "Root endpoint"),
            ("/status", "Status endpoint")
        ]
        
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    self.log_test(name, True)
                else:
                    self.log_test(name, False, f"HTTP {response.status_code}", 200, response.status_code)
            except Exception as e:
                self.log_test(name, False, f"Exception: {str(e)}")

    def test_beat_detail(self, beats):
        """Test individual beat detail endpoint"""
        if not beats:
            self.log_test("Beat detail endpoint", False, "No beats available to test")
            return
        
        beat_id = beats[0].get('beat_id')
        if not beat_id:
            self.log_test("Beat detail endpoint", False, "No beat_id found in first beat")
            return
        
        try:
            response = requests.get(f"{self.api_url}/beats/{beat_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['beat_id', 'name', 'genre', 'bpm', 'price_basica', 'audio_url', 'cover_url']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test(f"Beat detail: {beat_id}", True)
                else:
                    self.log_test(f"Beat detail: {beat_id}", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test(f"Beat detail: {beat_id}", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test(f"Beat detail: {beat_id}", False, f"Exception: {str(e)}")

    def test_contracts_list_endpoint(self):
        """Test GET /api/payment/contracts/list endpoint"""
        try:
            response = requests.get(f"{self.api_url}/payment/contracts/list", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Expected structure: {"basica": {"es": null, "en": null}, "premium": {...}, "exclusiva": {...}}
                expected_licenses = ["basica", "premium", "exclusiva"]
                expected_languages = ["es", "en"]
                
                if all(license_type in data for license_type in expected_licenses):
                    # Check structure for each license type
                    valid_structure = True
                    for license_type in expected_licenses:
                        if not isinstance(data[license_type], dict):
                            valid_structure = False
                            break
                        for lang in expected_languages:
                            if lang not in data[license_type]:
                                valid_structure = False
                                break
                    
                    if valid_structure:
                        self.log_test("GET /api/payment/contracts/list", True, f"Structure valid: {data}")
                    else:
                        self.log_test("GET /api/payment/contracts/list", False, "Invalid contract structure")
                else:
                    self.log_test("GET /api/payment/contracts/list", False, f"Missing license types. Got: {list(data.keys())}")
            else:
                self.log_test("GET /api/payment/contracts/list", False, f"HTTP {response.status_code}", 200, response.status_code)
        except Exception as e:
            self.log_test("GET /api/payment/contracts/list", False, f"Exception: {str(e)}")

    def test_contract_download_validation(self):
        """Test contract download endpoint validation (should fail without valid purchase)"""
        test_cases = [
            ("basica", "es"),
            ("premium", "en"),
            ("exclusiva", "es")
        ]
        
        for license_type, language in test_cases:
            try:
                # Test without valid purchase - should return 403
                response = requests.get(
                    f"{self.api_url}/payment/contract/{license_type}/{language}",
                    params={
                        "buyer_email": "test@example.com",
                        "beat_id": "test_beat_id"
                    },
                    timeout=10
                )
                
                if response.status_code == 403:
                    self.log_test(f"Contract validation {license_type}/{language}", True, "Correctly blocked unauthorized access")
                elif response.status_code == 404:
                    self.log_test(f"Contract validation {license_type}/{language}", True, "Contract file not found (expected for empty directories)")
                else:
                    self.log_test(f"Contract validation {license_type}/{language}", False, f"Expected 403/404, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Contract validation {license_type}/{language}", False, f"Exception: {str(e)}")

    def test_contract_endpoint_parameters(self):
        """Test contract endpoint parameter validation"""
        # Test invalid license type
        try:
            response = requests.get(
                f"{self.api_url}/payment/contract/invalid/es",
                params={"buyer_email": "test@example.com", "beat_id": "test"},
                timeout=10
            )
            if response.status_code == 400:
                self.log_test("Contract invalid license type", True, "Correctly rejected invalid license")
            else:
                self.log_test("Contract invalid license type", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Contract invalid license type", False, f"Exception: {str(e)}")
        
        # Test invalid language
        try:
            response = requests.get(
                f"{self.api_url}/payment/contract/basica/fr",
                params={"buyer_email": "test@example.com", "beat_id": "test"},
                timeout=10
            )
            if response.status_code == 400:
                self.log_test("Contract invalid language", True, "Correctly rejected invalid language")
            else:
                self.log_test("Contract invalid language", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Contract invalid language", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests"""
        print(f"🚀 Starting API tests for: {self.base_url}")
        print("=" * 60)
        
        # Test beats API and get beats data
        beats = self.test_beats_api()
        
        # Test file access
        self.test_beat_audio_access(beats)
        self.test_beat_cover_access(beats)
        
        # Test payment configurations
        self.test_stripe_config()
        self.test_paypal_config()
        
        # Test basic endpoints
        self.test_basic_endpoints()
        
        # Test beat detail
        self.test_beat_detail(beats)
        
        # Test new contract endpoints
        print("\n🔒 Testing Contract License System:")
        self.test_contracts_list_endpoint()
        self.test_contract_download_validation()
        self.test_contract_endpoint_parameters()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": round(self.tests_passed/self.tests_run*100, 1),
            "test_results": self.test_results,
            "beats_found": len(beats) if beats else 0
        }

def main():
    tester = BeatsMarketplaceAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["failed_tests"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())