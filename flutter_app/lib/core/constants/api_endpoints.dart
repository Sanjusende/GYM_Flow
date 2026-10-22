class ApiEndpoints {
  // Use 10.0.2.2 for Android Emulator, localhost for iOS / Web / Desktop, or custom local network IP for physical device
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  static const String desktopBaseUrl = 'http://localhost:5000/api';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyOtp = '/auth/verify-otp';
  static const String demoLogin = '/auth/demo-login';
  static const String me = '/auth/me';
  static const String profile = '/auth/profile';

  // Dashboard
  static const String dashboardStats = '/dashboard/stats';

  // Members
  static const String members = '/members';
  static String renewMember(String id) => '/members/$id/renew';
  static String clearDue(String id) => '/members/$id/clear-due';

  // Plans
  static const String plans = '/plans';

  // Public Portal & 7-Day Indian Diet
  static String publicMemberCheck(String phone) => '/public/member/$phone';
  static String publicMemberDiet(String id) => '/public/member/$id/diet';
}
