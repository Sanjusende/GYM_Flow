import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/app_colors.dart';

class UpiQrDialog extends StatelessWidget {
  final String gymName;
  final String upiId;
  final String? upiQrCodeUrl;
  final num? amount;

  const UpiQrDialog({
    super.key,
    required this.gymName,
    required this.upiId,
    this.upiQrCodeUrl,
    this.amount,
  });

  Widget _buildQrImage() {
    if (upiQrCodeUrl != null && upiQrCodeUrl!.trim().isNotEmpty) {
      final trimmed = upiQrCodeUrl!.trim();
      if (trimmed.startsWith('data:image')) {
        try {
          final base64String = trimmed.split(',').last;
          final Uint8List bytes = base64Decode(base64String);
          return Image.memory(
            bytes,
            width: 220,
            height: 220,
            fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => _buildFallbackQr(),
          );
        } catch (_) {
          return _buildFallbackQr();
        }
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return Image.network(
          trimmed,
          width: 220,
          height: 220,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _buildFallbackQr(),
        );
      } else {
        // Raw base64 string
        try {
          final Uint8List bytes = base64Decode(trimmed);
          return Image.memory(
            bytes,
            width: 220,
            height: 220,
            fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => _buildFallbackQr(),
          );
        } catch (_) {
          return _buildFallbackQr();
        }
      }
    }
    return _buildFallbackQr();
  }

  Widget _buildFallbackQr() {
    final amtParam = (amount != null && amount! > 0) ? '&am=$amount' : '';
    final upiPayload = 'upi://pay?pa=$upiId&pn=${Uri.encodeComponent(gymName)}$amtParam&cu=INR';
    final qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${Uri.encodeComponent(upiPayload)}';

    return Image.network(
      qrUrl,
      width: 220,
      height: 220,
      fit: BoxFit.contain,
      loadingBuilder: (ctx, child, progress) {
        if (progress == null) return child;
        return const SizedBox(
          width: 220,
          height: 220,
          child: Center(
            child: CircularProgressIndicator(color: AppColors.neonGreen, strokeWidth: 2),
          ),
        );
      },
      errorBuilder: (_, __, ___) => Container(
        width: 220,
        height: 220,
        color: Colors.black26,
        child: const Center(
          child: Text('QR Code Unavailable', style: TextStyle(color: Colors.white70, fontSize: 12)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.darkCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: AppColors.neonGreen.withOpacity(0.3), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
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
                      child: const Icon(Icons.qr_code_scanner, color: AppColors.neonGreen, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          gymName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Text(
                          'Scan & Pay via UPI',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Optional Amount Badge
            if (amount != null && amount! > 0) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.amberWarning.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.amberWarning.withOpacity(0.4)),
                ),
                child: Text(
                  'Amount Due: ₹$amount',
                  style: const TextStyle(
                    color: AppColors.amberWarning,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // QR Code Container
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.neonGreen.withOpacity(0.2),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: _buildQrImage(),
              ),
            ),
            const SizedBox(height: 16),

            // UPI ID with Copy
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.darkSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('UPI ID', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                        Text(
                          upiId,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            fontFamily: 'monospace',
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: upiId));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('UPI ID copied to clipboard!'),
                          duration: Duration(seconds: 2),
                          backgroundColor: AppColors.neonGreen,
                        ),
                      );
                    },
                    icon: const Icon(Icons.copy, size: 14, color: AppColors.neonGreen),
                    label: const Text(
                      'Copy',
                      style: TextStyle(color: AppColors.neonGreen, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined, size: 13, color: AppColors.textMuted),
                SizedBox(width: 4),
                Text(
                  'Accepts GPay, PhonePe, Paytm, BHIM',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
