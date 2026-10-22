class MemberModel {
  final String id;
  final String name;
  final String phone;
  final String gender;
  final String planId;
  final String planName;
  final DateTime startDate;
  final DateTime endDate;
  final String status; // 'Active', 'Expiring_Soon', 'Expired'
  final int diffDays;
  final int paidAmount;
  final int dueAmount;
  final Map<String, dynamic>? aiDietPlan;

  MemberModel({
    required this.id,
    required this.name,
    required this.phone,
    this.gender = 'Male',
    required this.planId,
    required this.planName,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.diffDays,
    required this.paidAmount,
    required this.dueAmount,
    this.aiDietPlan,
  });

  factory MemberModel.fromJson(Map<String, dynamic> json) {
    final end = json['endDate'] != null ? DateTime.parse(json['endDate']) : DateTime.now();
    final now = DateTime.now();
    final computedDiff = end.difference(now).inDays;

    final planRaw = json['currentPlan'] ?? json['planId'];
    final planIdStr = planRaw is Map ? (planRaw['_id'] ?? '') : (planRaw ?? '');
    final planNameStr = json['planName'] ?? (planRaw is Map ? planRaw['planName'] : 'General Plan');

    final statusStr = json['status'] ?? (computedDiff < 0 ? 'Expired' : (computedDiff <= 5 ? 'Expiring_Soon' : 'Active'));

    return MemberModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      gender: json['gender'] ?? 'Male',
      planId: planIdStr,
      planName: planNameStr,
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : DateTime.now(),
      endDate: end,
      status: statusStr,
      diffDays: json['diffDays'] ?? computedDiff,
      paidAmount: json['paidAmount'] ?? 0,
      dueAmount: json['dueAmount'] ?? 0,
      aiDietPlan: json['aiDietPlan'] is Map<String, dynamic> ? json['aiDietPlan'] : null,
    );
  }

  bool get isExpired => status == 'Expired' || diffDays < 0;
  bool get isExpiring => status == 'Expiring_Soon' || (diffDays >= 0 && diffDays <= 5);
  bool get hasDue => dueAmount > 0;
}
