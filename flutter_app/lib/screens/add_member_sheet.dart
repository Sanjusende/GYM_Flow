import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/gym_provider.dart';

class AddMemberSheet extends StatefulWidget {
  const AddMemberSheet({super.key});

  @override
  State<AddMemberSheet> createState() => _AddMemberSheetState();
}

class _AddMemberSheetState extends State<AddMemberSheet> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _totalFeeController = TextEditingController();
  final _paidAmountController = TextEditingController();

  String? _selectedPlanId;
  String _paymentMode = 'UPI';
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final gymProv = Provider.of<GymProvider>(context, listen: false);
    if (gymProv.plans.isNotEmpty) {
      final firstPlan = gymProv.plans.first;
      _selectedPlanId = firstPlan.id;
      _totalFeeController.text = '${firstPlan.price}';
      _paidAmountController.text = '${firstPlan.price}';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _totalFeeController.dispose();
    _paidAmountController.dispose();
    super.dispose();
  }

  void _onPlanChanged(String? planId) {
    if (planId == null) return;
    setState(() => _selectedPlanId = planId);
    final gymProv = Provider.of<GymProvider>(context, listen: false);
    final plan = gymProv.plans.firstWhere((p) => p.id == planId, orElse: () => gymProv.plans.first);
    setState(() {
      _totalFeeController.text = '${plan.price}';
      _paidAmountController.text = '${plan.price}';
    });
  }

  // Live auto-calculation: dueAmount = planPrice - paidAmount
  int get _dueAmount {
    final fee = int.tryParse(_totalFeeController.text) ?? 0;
    final paid = int.tryParse(_paidAmountController.text) ?? 0;
    return (fee - paid) > 0 ? (fee - paid) : 0;
  }

  void _submit() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim().replaceAll(RegExp(r'\D'), '');
    final totalFee = int.tryParse(_totalFeeController.text) ?? 0;
    final paid = int.tryParse(_paidAmountController.text) ?? 0;

    if (name.isEmpty) {
      setState(() => _error = 'Please enter member full name.');
      return;
    }
    if (phone.length < 10) {
      setState(() => _error = 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (_selectedPlanId == null) {
      setState(() => _error = 'Please select a membership plan.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    final gymProv = Provider.of<GymProvider>(context, listen: false);
    final success = await gymProv.addMember(
      name: name,
      phone: phone.substring(phone.length - 10),
      planId: _selectedPlanId!,
      totalFee: totalFee,
      paidAmount: paid,
      paymentMode: _paymentMode,
    );

    setState(() => _loading = false);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚡ Member registered successfully in 10 seconds!'),
          backgroundColor: AppColors.neonGreen,
        ),
      );
    } else if (mounted) {
      setState(() => _error = 'Failed to register member. Please check backend connection.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final gymProv = Provider.of<GymProvider>(context);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.neonGreen.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.bolt, color: AppColors.neonGreen, size: 20),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Fast Member Entry',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.neonGreen.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '⚡ 10 SECONDS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.neonGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (_error != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.roseDanger.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _error!,
                  style: const TextStyle(color: AppColors.roseDanger, fontSize: 12),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Name
            TextField(
              controller: _nameController,
              autofocus: true,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: _inputDecoration('Full Name (e.g. Rahul Sharma)', Icons.person_outline),
            ),
            const SizedBox(height: 12),

            // Phone
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: _inputDecoration('10-Digit Phone No. (e.g. 9820111223)', Icons.phone_outlined),
            ),
            const SizedBox(height: 12),

            // Plan Dropdown
            if (gymProv.plans.isNotEmpty)
              DropdownButtonFormField<String>(
                value: _selectedPlanId,
                dropdownColor: AppColors.darkSurface,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: _inputDecoration('Select Membership Plan', Icons.card_membership),
                items: gymProv.plans.map((p) {
                  return DropdownMenuItem<String>(
                    value: p.id,
                    child: Text('${p.planName} (${p.durationInDays}d) — ₹${p.price}'),
                  );
                }).toList(),
                onChanged: _onPlanChanged,
              ),

            const SizedBox(height: 14),

            // Fee & Paid Row
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _totalFeeController,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: _inputDecoration('Plan Price (₹)', Icons.currency_rupee),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _paidAmountController,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(
                      color: AppColors.neonGreen,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                    decoration: _inputDecoration('Paid Now (₹)', Icons.check_circle_outline),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Live Calculated Udhaari Due (dueAmount = planPrice - paidAmount)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: _dueAmount > 0
                    ? AppColors.roseDanger.withOpacity(0.12)
                    : AppColors.neonGreen.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _dueAmount > 0
                      ? AppColors.roseDanger.withOpacity(0.3)
                      : AppColors.neonGreen.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Pending Udhaari (Due):',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                  Text(
                    '₹$_dueAmount',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: _dueAmount > 0 ? AppColors.roseDanger : AppColors.neonGreen,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.neonGreen,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.bolt, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      _loading ? 'Registering...' : 'Save Member (⚡ 10s)',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 20),
      labelText: label,
      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
      filled: true,
      fillColor: AppColors.darkSurface,
      contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
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
    );
  }
}
