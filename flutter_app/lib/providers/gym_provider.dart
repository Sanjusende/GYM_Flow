import 'package:flutter/material.dart';
import '../core/services/api_client.dart';
import '../core/constants/api_endpoints.dart';
import '../models/member_model.dart';
import '../models/plan_model.dart';

class GymProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  int _activeCount = 0;
  int _expiringSoonCount = 0;
  int _expiredCount = 0;
  int _totalPendingDues = 0;
  int _monthlyRevenue = 0;

  List<MemberModel> _members = [];
  List<MemberModel> _expiringSoonMembers = [];
  List<MemberModel> _expiredMembers = [];
  List<MemberModel> _pendingDueMembers = [];
  List<PlanModel> _plans = [];

  bool get isLoading => _isLoading;
  int get activeCount => _activeCount;
  int get expiringSoonCount => _expiringSoonCount;
  int get expiredCount => _expiredCount;
  int get totalPendingDues => _totalPendingDues;
  int get monthlyRevenue => _monthlyRevenue;

  List<MemberModel> get members => _members;
  List<MemberModel> get expiringSoonMembers => _expiringSoonMembers;
  List<MemberModel> get expiredMembers => _expiredMembers;
  List<MemberModel> get pendingDueMembers => _pendingDueMembers;
  List<PlanModel> get plans => _plans;

  // Fetch Dashboard Stats & 3 Alert Lists
  Future<void> fetchDashboardStats() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _apiClient.dio.get(ApiEndpoints.dashboardStats);
      if (res.data['success'] == true) {
        _activeCount = res.data['activeCount'] ?? res.data['stats']?['activeMembers'] ?? 0;
        _expiringSoonCount = res.data['expiringSoonCount'] ?? res.data['stats']?['expiringMembers'] ?? 0;
        _expiredCount = res.data['expiredCount'] ?? res.data['stats']?['expiredMembers'] ?? 0;
        _totalPendingDues = res.data['totalPendingDues'] ?? res.data['stats']?['totalUdhaari'] ?? 0;
        _monthlyRevenue = res.data['monthlyRevenue'] ?? res.data['stats']?['monthRevenue'] ?? 0;

        final expRaw = res.data['expiringSoonMembers'] ?? res.data['expiringList'] ?? [];
        _expiringSoonMembers = (expRaw as List).map((e) => MemberModel.fromJson(e)).toList();

        final expdRaw = res.data['expiredMembers'] ?? res.data['expiredList'] ?? [];
        _expiredMembers = (expdRaw as List).map((e) => MemberModel.fromJson(e)).toList();

        final udhRaw = res.data['pendingDueMembers'] ?? res.data['udhaariList'] ?? [];
        _pendingDueMembers = (udhRaw as List).map((e) => MemberModel.fromJson(e)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching dashboard stats: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch Members Directory with search & filter
  Future<void> fetchMembers({String? search, String? filter}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _apiClient.dio.get(
        ApiEndpoints.members,
        queryParameters: {
          if (search != null && search.isNotEmpty) 'search': search,
          if (filter != null && filter != 'ALL') 'filter': filter,
        },
      );

      if (res.data['success'] == true) {
        final list = res.data['members'] as List<dynamic>? ?? [];
        _members = list.map((e) => MemberModel.fromJson(e)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching members: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch Plans
  Future<void> fetchPlans() async {
    try {
      final res = await _apiClient.dio.get(ApiEndpoints.plans);
      if (res.data['success'] == true) {
        final list = res.data['plans'] as List<dynamic>? ?? [];
        _plans = list.map((e) => PlanModel.fromJson(e)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching plans: $e');
    }
  }

  // Add Member
  Future<bool> addMember({
    required String name,
    required String phone,
    required String planId,
    required int totalFee,
    required int paidAmount,
    String paymentMode = 'UPI',
    String gender = 'Male',
  }) async {
    try {
      final res = await _apiClient.dio.post(
        ApiEndpoints.members,
        data: {
          'name': name,
          'phone': phone,
          'currentPlan': planId,
          'planId': planId,
          'totalFee': totalFee,
          'paidAmount': paidAmount,
          'paymentMode': paymentMode,
          'gender': gender,
        },
      );

      if (res.data['success'] == true) {
        await fetchDashboardStats();
        await fetchMembers();
        return true;
      }
    } catch (e) {
      debugPrint('Error adding member: $e');
    }
    return false;
  }

  // 1-Click Renew Plan
  Future<bool> renewMember(String memberId, {required String planId, required int paidAmount}) async {
    try {
      final res = await _apiClient.dio.put(
        ApiEndpoints.renewMember(memberId),
        data: {
          'currentPlan': planId,
          'planId': planId,
          'paidAmount': paidAmount,
          'paymentMode': 'UPI',
        },
      );

      if (res.data['success'] == true) {
        await fetchDashboardStats();
        await fetchMembers();
        return true;
      }
    } catch (e) {
      debugPrint('Error renewing member: $e');
    }
    return false;
  }

  // Clear Udhaari Due
  Future<bool> clearDue(String memberId, int amount) async {
    try {
      final res = await _apiClient.dio.put(
        ApiEndpoints.clearDue(memberId),
        data: {
          'amount': amount,
          'paymentMode': 'UPI',
        },
      );

      if (res.data['success'] == true) {
        await fetchDashboardStats();
        await fetchMembers();
        return true;
      }
    } catch (e) {
      debugPrint('Error clearing due: $e');
    }
    return false;
  }

  // Generate / Cache 7-Day Indian Diet Plan
  Future<String?> generateAiDiet({
    required String memberId,
    required String goal,
    required String dietType,
    bool forceRefresh = false,
  }) async {
    try {
      final res = await _apiClient.dio.post(
        ApiEndpoints.publicMemberDiet(memberId),
        data: {
          'goal': goal,
          'dietType': dietType,
          'forceRefresh': forceRefresh,
        },
      );

      if (res.data['success'] == true && res.data['dietPlan'] != null) {
        await fetchMembers();
        return res.data['dietPlan']['generatedPlan'];
      }
    } catch (e) {
      debugPrint('Error generating diet: $e');
    }
    return null;
  }
}
