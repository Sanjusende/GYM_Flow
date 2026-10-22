import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/gym_provider.dart';
import '../widgets/member_card.dart';
import '../widgets/upi_qr_dialog.dart';
import 'add_member_sheet.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});

  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  final _searchController = TextEditingController();
  String _activeFilter = 'ALL';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    Provider.of<GymProvider>(context, listen: false).fetchMembers(
      search: query,
      filter: _activeFilter,
    );
  }

  void _setFilter(String filter) {
    setState(() => _activeFilter = filter);
    Provider.of<GymProvider>(context, listen: false).fetchMembers(
      search: _searchController.text.trim(),
      filter: filter,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final gymProv = Provider.of<GymProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        title: const Text(
          'Gym Members',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1, color: AppColors.neonGreen),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const AddMemberSheet(),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Field
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search member by name or phone...',
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: AppColors.textMuted, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.darkCard,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.darkBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.darkBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.neonGreen),
                ),
              ),
            ),
          ),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                _buildFilterChip('ALL', 'All'),
                const SizedBox(width: 8),
                _buildFilterChip('ACTIVE', 'Active'),
                const SizedBox(width: 8),
                _buildFilterChip('EXPIRING', 'Expiring (5d)'),
                const SizedBox(width: 8),
                _buildFilterChip('EXPIRED', 'Expired'),
                const SizedBox(width: 8),
                _buildFilterChip('UDHAARI', 'Udhaari (Dues)'),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Members Card List
          Expanded(
            child: gymProv.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.neonGreen))
                : gymProv.members.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.search_off, size: 48, color: AppColors.textMuted),
                            SizedBox(height: 12),
                            Text(
                              'No members found',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => gymProv.fetchMembers(
                          search: _searchController.text.trim(),
                          filter: _activeFilter,
                        ),
                        color: AppColors.neonGreen,
                        backgroundColor: AppColors.darkCard,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: gymProv.members.length,
                          itemBuilder: (context, index) {
                            final member = gymProv.members[index];
                            return MemberCard(
                              member: member,
                              gymName: auth.gymName,
                              gymUpi: auth.upiId,
                              onRenew: () async {
                                await gymProv.renewMember(
                                  member.id,
                                  planId: member.planId,
                                  paidAmount: member.totalFee,
                                );
                              },
                              onClearDue: () => _showClearDueDialog(context, member, gymProv),
                              onDiet: () {
                                // Handled in AI diet tab
                              },
                            );
                          },
                        ),
                      ),
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

  Widget _buildFilterChip(String filterKey, String label) {
    final isSelected = _activeFilter == filterKey;
    return GestureDetector(
      onTap: () => _setFilter(filterKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.neonGreen : AppColors.darkCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.neonGreen : AppColors.darkBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
