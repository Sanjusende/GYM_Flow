class PlanModel {
  final String id;
  final String planName;
  final int durationInDays;
  final int price;
  final bool isActive;

  PlanModel({
    required this.id,
    required this.planName,
    required this.durationInDays,
    required this.price,
    this.isActive = true,
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    return PlanModel(
      id: json['_id'] ?? '',
      planName: json['planName'] ?? json['name'] ?? 'General Plan',
      durationInDays: json['durationInDays'] ?? (json['durationMonths'] != null ? json['durationMonths'] * 30 : 30),
      price: json['price'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'planName': planName,
      'durationInDays': durationInDays,
      'price': price,
      'isActive': isActive,
    };
  }
}
