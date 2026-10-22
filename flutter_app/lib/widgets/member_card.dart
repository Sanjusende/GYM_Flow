import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/constants/app_colors.dart';
import '../core/services/whatsapp_helper.dart';
import '../models/member_model.dart';

class MemberCard extends StatelessWidget {
  final MemberModel member;
  final String gymName;
  final String gymUpi;
  final VoidCallback onRenew;
  final VoidCallback onClearDue;
  final VoidCallback onDiet;

  const MemberCard({
    super.key,
    required this.member,
    required this.gymName,
    required this.gymUpi,
    required this.onRenew,
    required this.onClearDue,
    required this.onDiet,
  });

  Color _getStatusColor() {
    if (member.isExpired) return AppColors.roseDanger;
    if (member.isExpiring) return AppColors.amberWarning;
    return AppColors.neonGreen;
  }

  String _getStatusText() {
    if (member.isExpired) return 'Expired (${member.diffDays.abs()}d ago)';
    if (member.isExpiring) return 'Expiring in ${member.diffDays}d';
    return 'Active (${member.diffDays}d left)';
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final dateStr = DateFormat('dd MMM yyyy').format(member.endDate);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: member.hasDue
              ? AppColors.roseDanger.withOpacity(0.3)
              : AppColors.darkBorder,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Avatar, Name, Phone & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.darkSurface,
                      child: Text(
                        member.name.isNotEmpty ? member.name[0].toUpperCase() : 'M',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            member.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '📱 ${member.phone}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Status Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  _getStatusText(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(color: AppColors.darkBorder, height: 1),
          const SizedBox(height: 12),

          // Details Row: Plan & Due
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plan: ${member.planName}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    'Till: $dateStr',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (member.hasDue)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.roseDanger.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Udhaari: ₹${member.dueAmount}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.roseDanger,
                        ),
                      ),
                    )
                  else
                    const Text(
                      '✓ Fees Cleared',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.neonGreen,
                      ),
                    ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Quick Action Bar
          Row(
            children: [
              // 1-Tap Green WhatsApp Reminder (Zero Cost)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    WhatsAppHelper.sendReminder(
                      rawPhone: member.phone,
                      memberName: member.name,
                      gymName: gymName,
                      status: member.status,
                      diffDays: member.diffDays,
                      dueAmount: member.dueAmount,
                      upiId: gymUpi,
                    );
                  },
                  icon: const Icon(Icons.chat, size: 15, color: Colors.black),
                  label: const Text(
                    'WhatsApp',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.whatsapp,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // 1-Tap Direct Call Button
              IconButton(
                onPressed: () => WhatsAppHelper.makePhoneCall(member.phone),
                icon: const Icon(Icons.phone, size: 18, color: AppColors.neonGreen),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.darkSurface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
                tooltip: 'Direct Call',
              ),
              const SizedBox(width: 4),

              // 1-Tap Renew Button
              IconButton(
                onPressed: onRenew,
                icon: const Icon(Icons.refresh, size: 18, color: AppColors.textPrimary),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.darkSurface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
                tooltip: '1-Click Renew',
              ),

              // Settle Udhaari if due exists
              if (member.hasDue) ...[
                const SizedBox(width: 4),
                IconButton(
                  onPressed: onClearDue,
                  icon: const Icon(Icons.currency_rupee, size: 18, color: AppColors.amberWarning),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.darkSurface,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: AppColors.darkBorder),
                    ),
                  ),
                  tooltip: 'Clear Due',
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
