import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../providers/gym_provider.dart';
import 'dashboard_screen.dart';
import 'members_screen.dart';
import 'ai_diet_screen.dart';
import 'plans_screen.dart';
import 'add_member_sheet.dart';

class MainNavShell extends StatefulWidget {
  final int initialIndex;

  const MainNavShell({super.key, this.initialIndex = 0});

  @override
  State<MainNavShell> createState() => _MainNavShellState();
}

class _MainNavShellState extends State<MainNavShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final gymProv = Provider.of<GymProvider>(context, listen: false);
      gymProv.fetchDashboardStats();
      gymProv.fetchMembers();
      gymProv.fetchPlans();
    });
  }

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
  }

  void _openAddMemberSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddMemberSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    // 4 Distinct Tabs as specified in requirements
    final screens = [
      DashboardScreen(
        onNavigateToMembers: (filter) {
          setState(() => _currentIndex = 1);
        },
      ),
      const MembersScreen(),
      const AiDietScreen(),
      const PlansScreen(),
    ];

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: screens[_currentIndex],
      floatingActionButton: FloatingActionButton(
        onPressed: _openAddMemberSheet,
        backgroundColor: AppColors.neonGreen,
        foregroundColor: Colors.black,
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add, size: 28),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.darkCard,
          border: Border(top: BorderSide(color: AppColors.darkBorder, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          backgroundColor: AppColors.darkCard,
          selectedItemColor: AppColors.neonGreen,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_alt_outlined),
              activeIcon: Icon(Icons.people_alt),
              label: 'Members',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_awesome_outlined),
              activeIcon: Icon(Icons.auto_awesome),
              label: 'AI Diet',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.credit_card_outlined),
              activeIcon: Icon(Icons.credit_card),
              label: 'Plans',
            ),
          ],
        ),
      ),
    );
  }
}
