import 'package:url_launcher/url_launcher.dart';

class WhatsAppHelper {
  // Zero-Cost 1-Click WhatsApp Reminder with polite Hinglish message
  static Future<bool> sendReminder({
    required String rawPhone,
    required String memberName,
    required String gymName,
    required String status,
    required int diffDays,
    required int dueAmount,
    String upiId = 'ironparadise@okaxis',
  }) async {
    final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
    final formattedPhone = cleanPhone.length > 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

    String message = '';

    if (dueAmount > 0 && (status == 'Expired' || diffDays < 0)) {
      message = 'Namaste $memberName ji! 🙏\n'
          'Aapki *$gymName* ki gym membership expire ho chuki hai.\n'
          'Aapka pending balance: *₹$dueAmount* baaki hai.\n\n'
          'Aap workout continue rakhne ke liye fees directly UPI se pay kar sakte hain:\n'
          '👉 UPI ID: *$upiId*\n\n'
          'Thank you, Team $gymName 🏋️‍♂️';
    } else if (dueAmount > 0) {
      message = 'Namaste $memberName ji! 🙏\n'
          'Gentle reminder from *$gymName*:\n'
          'Aapka gym fees balance: *₹$dueAmount* pending hai.\n\n'
          'Aap direct UPI se pay kar sakte hain:\n'
          '👉 UPI ID: *$upiId*\n\n'
          'Have a powerful workout today! 💪';
    } else if (status == 'Expiring_Soon' || diffDays <= 5) {
      message = 'Namaste $memberName ji! 🏋️‍♂️\n'
          'Aapki *$gymName* ki membership agle *$diffDays dino me expire* hone wali hai.\n\n'
          'Apna workout routine uninterrupted rakhne ke liye time se renew karayein.\n'
          '👉 UPI ID: *$upiId*\n\n'
          'Best regards, Team $gymName';
    } else if (status == 'Expired') {
      message = 'Namaste $memberName ji! 💪\n'
          'Hum aapko *$gymName* me miss kar rahe hain! Is hafte renew karayein aur updated Indian Gym Diet Plan paayein.\n\n'
          'Regards, Team $gymName';
    } else {
      message = 'Hello $memberName ji! 👋\n'
          'Greetings from *$gymName*! Workout me consistency banaye rakhein. Stay fit, stay strong!';
    }

    final urlString = 'https://wa.me/91$formattedPhone?text=${Uri.encodeComponent(message)}';
    final uri = Uri.parse(urlString);

    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }

  // Direct Phone Call Launcher
  static Future<bool> makePhoneCall(String rawPhone) async {
    final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:+91$cleanPhone');
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri);
    }
    return false;
  }

  // 1-Tap Share 7-Day Indian Diet to WhatsApp
  static Future<bool> shareDiet({
    required String rawPhone,
    required String memberName,
    required String gymName,
    required String dietText,
  }) async {
    final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
    final formattedPhone = cleanPhone.length > 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

    final text = 'Namaste $memberName! 🥗 Here is your 7-Day Indian Gym Diet Chart from *$gymName*:\n\n$dietText';
    final urlString = 'https://wa.me/91$formattedPhone?text=${Uri.encodeComponent(text)}';
    final uri = Uri.parse(urlString);

    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
