import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/gym_provider.dart';
import '../widgets/stat_card.dart';
import '../widgets/member_card.dart';
import '../widgets/upi_qr_dialog.dart';

class DashboardScreen extends StatefulWidget {
  final Function(String filter)? onNavigateToMembers;

  const DashboardScreen({super.key, this.onNavigateToMembers});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _selectedTab = 'EXPIRING'; // 'EXPIRING' | 'EXPIRED' | 'UDHAARI'

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final gymProv = Provider.of<GymProvider>(context);

    // Pick active list matching the 3 segmented tabs
    final currentList = _selectedTab == 'EXPIRING'
        ? gymProv.expiringSoonMembers
        : (_selectedTab == 'EXPIRED'
            ? gymProv.expiredMembers
            : gymProv.pendingDueMembers);

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              auth.gymName,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            Text(
              'UPI: ${auth.upiId}',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_2, color: AppColors.neonGreen, size: 26),
            tooltip: 'Gym UPI QR Code',
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => UpiQrDialog(
                  gymName: auth.gymName,
                  upiId: auth.upiId,
                  upiQrCodeUrl: auth.upiQrCodeUrl,
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
            onPressed: () => gymProv.fetchDashboardStats(),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.roseDanger),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => gymProv.fetchDashboardStats(),
        color: AppColors.neonGreen,
        backgroundColor: AppColors.darkCard,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 2x2 KPI StatCard Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.15,
                children: [
                  StatCard(
                    title: 'Active Members',
                    value: '${gymProv.activeCount}',
                    subtext: 'Regular Lifters',
                    icon: Icons.check_circle_outline,
                    accentColor: AppColors.neonGreen,
                    onTap: () => widget.onNavigateToMembers?.call('Active'),
                  ),
                  StatCard(
                    title: 'Expiring in 5d',
                    value: '${gymProv.expiringSoonCount}',
                    subtext: 'Send WhatsApp',
                    icon: Icons.warning_amber_rounded,
                    accentColor: AppColors.amberWarning,
                    onTap: () => setState(() => _selectedTab = 'EXPIRING'),
                  ),
                  StatCard(
                    title: 'Expired',
                    value: '${gymProv.expiredCount}',
                    subtext: 'Win-back Calls',
                    icon: Icons.person_off_outlined,
                    accentColor: AppColors.roseDanger,
                    onTap: () => setState(() => _selectedTab = 'EXPIRED'),
                  ),
                  StatCard(
                    title: 'Total Udhaari',
                    value: '₹${gymProv.totalPendingDues}',
                    subtext: 'Pending Balances',
                    icon: Icons.currency_rupee,
                    accentColor: AppColors.cyanAccent,
                    onTap: () => setState(() => _selectedTab = 'UDHAARI'),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Segmented Action Tabs Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Priority Action Center',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    '${currentList.length} Members',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 3 Segmented Tabs: Expiring Soon, Expired, Pending Udhaari
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildTabChip('EXPIRING', 'Expiring Soon (${gymProv.expiringSoonMembers.length})', AppColors.amberWarning),
                    const SizedBox(width: 8),
                    _buildTabChip('EXPIRED', 'Expired (${gymProv.expiredMembers.length})', AppColors.roseDanger),
                    const SizedBox(width: 8),
                    _buildTabChip('UDHAARI', 'Pending Udhaari (${gymProv.pendingDueMembers.length})', AppColors.cyanAccent),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Action Members List with MemberCards
              if (gymProv.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: AppColors.neonGreen),
                  ),
                )
              else if (currentList.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.darkCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.darkBorder),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.celebration,
                        size: 36,
                        color: _selectedTab == 'UDHAARI' ? AppColors.neonGreen : AppColors.textMuted,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _selectedTab == 'UDHAARI'
                            ? 'All dues are fully cleared!'
                            : 'No members in this section.',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: currentList.length,
                  itemBuilder: (context, index) {
                    final member = currentList[index];
                    return MemberCard(
                      member: member,
                      gymName: auth.gymName,
                      gymUpi: auth.upiId,
                      onRenew: () => _showQuickRenewDialog(context, member, gymProv),
                      onClearDue: () => _showClearDueDialog(context, member, gymProv),
                      onDiet: () {},
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabChip(String tabKey, String label, Color color) {
    final isSelected = _selectedTab == tabKey;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = tabKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.18) : AppColors.darkCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color : AppColors.darkBorder,
            width: 1.2,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? color : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  void _showQuickRenewDialog(BuildContext context, dynamic member, GymProvider gymProv) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Renew ${member.name}?',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Text(
          '1-Click renew for ${member.planName}?',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await gymProv.renewMember(member.id, planId: member.planId, paidAmount: member.paidAmount);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.neonGreen,
              foregroundColor: Colors.black,
            ),
            child: const Text('Renew Now'),
          ),
        ],
      ),
    );
  }

  void _showClearDueDialog(BuildContext context, dynamic member, GymProvider gymProv) {
    final auth = Provider.of<AuthProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Clear Due for ${member.name}',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Settle pending Udhaari of ₹${member.dueAmount} via UPI or Cash:',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (_) => UpiQrDialog(
                      gymName: auth.gymName,
                      upiId: auth.upiId,
                      upiQrCodeUrl: auth.upiQrCodeUrl,
                      amount: member.dueAmount,
                    ),
                  );
                },
                icon: const Icon(Icons.qr_code_scanner, size: 16, color: AppColors.neonGreen),
                label: const Text(
                  'Show Member UPI QR Code',
                  style: TextStyle(color: AppColors.neonGreen, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.neonGreen),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await gymProv.clearDue(member.id, member.dueAmount);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.amberWarning,
              foregroundColor: Colors.black,
            ),
            child: const Text('Mark Settled'),
          ),
        ],
      ),
    );
  }
}
