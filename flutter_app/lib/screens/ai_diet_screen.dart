import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/services/whatsapp_helper.dart';
import '../providers/auth_provider.dart';
import '../providers/gym_provider.dart';
import '../models/member_model.dart';

class AiDietScreen extends StatefulWidget {
  final MemberModel? preselectedMember;

  const AiDietScreen({super.key, this.preselectedMember});

  @override
  State<AiDietScreen> createState() => _AiDietScreenState();
}

class _AiDietScreenState extends State<AiDietScreen> {
  String? _selectedMemberId;
  String _goal = 'Muscle Gain';
  String _dietType = 'Pure Veg';
  String? _dietText;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.preselectedMember != null) {
      _selectedMemberId = widget.preselectedMember!.id;
      _dietText = widget.preselectedMember!.aiDietPlan?['generatedPlan'];
    }
  }

  void _generateDiet(bool forceRefresh) async {
    if (_selectedMemberId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a gym member.')),
      );
      return;
    }

    setState(() => _loading = true);
    final gymProv = Provider.of<GymProvider>(context, listen: false);

    final result = await gymProv.generateAiDiet(
      memberId: _selectedMemberId!,
      goal: _goal,
      dietType: _dietType,
      forceRefresh: forceRefresh,
    );

    setState(() {
      _dietText = result;
      _loading = false;
    });
  }

  void _shareToWhatsApp() async {
    if (_dietText == null || _selectedMemberId == null) return;
    final gymProv = Provider.of<GymProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final member = gymProv.members.firstWhere((m) => m.id == _selectedMemberId);

    await WhatsAppHelper.shareDiet(
      rawPhone: member.phone,
      memberName: member.name,
      gymName: auth.gymName,
      dietText: _dietText!,
    );
  }

  @override
  Widget build(BuildContext context) {
    final gymProv = Provider.of<GymProvider>(context);

    if (_selectedMemberId == null && gymProv.members.isNotEmpty) {
      _selectedMemberId = gymProv.members.first.id;
      _dietText = gymProv.members.first.aiDietPlan?['generatedPlan'];
    }

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        title: const Text(
          'Gemini 2.5 AI Indian Diet',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.cyanAccent.withOpacity(0.2),
                    AppColors.darkCard,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cyanAccent.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.cyanAccent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.auto_awesome, color: AppColors.cyanAccent, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Gemini 2.5 Flash Indian Gym Diet',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        Text(
                          'Customized Indian bodybuilding meals cached for 7 days.',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Member Selector Dropdown
            if (gymProv.members.isNotEmpty)
              DropdownButtonFormField<String>(
                value: _selectedMemberId,
                dropdownColor: AppColors.darkSurface,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Select Gym Member',
                  labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  prefixIcon: const Icon(Icons.person_search, color: AppColors.textSecondary, size: 20),
                  filled: true,
                  fillColor: AppColors.darkCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
                items: gymProv.members.map((m) {
                  return DropdownMenuItem<String>(
                    value: m.id,
                    child: Text('${m.name} (${m.phone})'),
                  );
                }).toList(),
                onChanged: (id) {
                  setState(() {
                    _selectedMemberId = id;
                    final member = gymProv.members.firstWhere((m) => m.id == id);
                    _dietText = member.aiDietPlan?['generatedPlan'];
                  });
                },
              ),

            const SizedBox(height: 12),

            // Goal & Diet Type Selection
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _goal,
                    dropdownColor: AppColors.darkSurface,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      labelText: 'Fitness Goal',
                      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      filled: true,
                      fillColor: AppColors.darkCard,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Muscle Gain', child: Text('Muscle Gain')),
                      DropdownMenuItem(value: 'Fat Loss', child: Text('Fat Loss')),
                      DropdownMenuItem(value: 'Lean Bulking', child: Text('Lean Bulking')),
                      DropdownMenuItem(value: 'Strength', child: Text('Strength')),
                    ],
                    onChanged: (v) => setState(() => _goal = v ?? 'Muscle Gain'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _dietType,
                    dropdownColor: AppColors.darkSurface,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      labelText: 'Diet Type',
                      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      filled: true,
                      fillColor: AppColors.darkCard,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Pure Veg', child: Text('Pure Veg')),
                      DropdownMenuItem(value: 'Eggetarian', child: Text('Eggetarian')),
                      DropdownMenuItem(value: 'Non-Veg', child: Text('Non-Veg')),
                    ],
                    onChanged: (v) => setState(() => _dietType = v ?? 'Pure Veg'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Generate Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : () => _generateDiet(true),
                icon: _loading
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                      )
                    : const Icon(Icons.auto_awesome, size: 18, color: Colors.black),
                label: Text(
                  _loading ? 'Generating with Gemini...' : 'Generate 7-Day Indian Diet Plan',
                  style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cyanAccent,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Diet Output Area
            if (_dietText != null && _dietText!.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.darkCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.darkBorder),
                ),
                child: Text(
                  _dietText!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textPrimary,
                    height: 1.5,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // 1-Tap Share Directly to Member's WhatsApp
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _shareToWhatsApp,
                  icon: const Icon(Icons.chat, color: Colors.black, size: 20),
                  label: const Text(
                    '1-Tap Share Diet to Member on WhatsApp',
                    style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.whatsapp,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
