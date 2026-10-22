import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../core/services/api_client.dart';
import '../core/constants/api_endpoints.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = false;
  bool _isAuthenticated = false;
  Map<String, dynamic>? _gym;
  String? _token;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get gym => _gym;
  String? get token => _token;
  String get gymName => _gym?['gymName'] ?? 'Iron Paradise Fitness Hub';
  String get upiId => _gym?['upiId'] ?? 'gymflow@upi';
  String? get upiQrCodeUrl => _gym?['upiQrCodeUrl'];
  String get phone => _gym?['phone'] ?? '';
  String get ownerName => _gym?['ownerName'] ?? '';
  bool get isVerified => _gym?['isVerified'] ?? false;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final savedToken = prefs.getString('gymflow_token');

      if (savedToken != null && savedToken.isNotEmpty) {
        _token = savedToken;
        final response = await _apiClient.dio.get(ApiEndpoints.me);
        if (response.statusCode == 200 && response.data['success'] == true) {
          _gym = response.data['gym'];
          _isAuthenticated = true;
        } else {
          await logout();
        }
      }
    } catch (e) {
      // offline or server error
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiEndpoints.register,
        data: data,
      );

      _isLoading = false;
      notifyListeners();

      if (response.data['success'] == true) {
        return {
          'success': true,
          'message': response.data['message'],
          'phone': response.data['phone'],
          'devOtp': response.data['devOtp'],
        };
      }
      return {
        'success': false,
        'message': response.data['message'] ?? 'Registration failed',
      };
    } on DioException catch (e) {
      _isLoading = false;
      notifyListeners();
      final errorMsg = e.response?.data?['message'] ?? e.message ?? 'Registration failed';
      return {
        'success': false,
        'message': errorMsg,
      };
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiEndpoints.verifyOtp,
        data: {'phone': phone, 'otp': otp},
      );

      _isLoading = false;
      if (response.data['success'] == true) {
        await _saveAuthData(response.data['token'], response.data['gym']);
        notifyListeners();
        return {'success': true};
      } else {
        notifyListeners();
        return {
          'success': false,
          'message': response.data['message'] ?? 'OTP verification failed',
        };
      }
    } on DioException catch (e) {
      _isLoading = false;
      notifyListeners();
      final errorMsg = e.response?.data?['message'] ?? e.message ?? 'OTP verification failed';
      return {
        'success': false,
        'message': errorMsg,
      };
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.put(
        ApiEndpoints.profile,
        data: data,
      );

      if (response.data['success'] == true) {
        _gym = response.data['gym'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Profile update error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        ApiEndpoints.login,
        data: {'email': email.trim(), 'password': password},
      );

      if (response.data['success'] == true) {
        await _saveAuthData(response.data['token'], response.data['gym']);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  // 1-Tap Demo Gym Login
  Future<bool> demoLogin() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(ApiEndpoints.demoLogin);
      if (response.data['success'] == true) {
        await _saveAuthData(response.data['token'], response.data['gym']);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Demo Login Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> _saveAuthData(String token, Map<String, dynamic> gymData) async {
    _token = token;
    _gym = gymData;
    _isAuthenticated = true;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('gymflow_token', token);
  }

  Future<void> logout() async {
    _token = null;
    _gym = null;
    _isAuthenticated = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('gymflow_token');
    notifyListeners();
  }
}
