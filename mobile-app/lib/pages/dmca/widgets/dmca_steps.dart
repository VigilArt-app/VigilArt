import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../dmca_form_utils.dart';
import '../dmca_schema_form.dart';

typedef ProfileFieldSetter = void Function(String);

class DmcaProfileStep extends StatelessWidget {
  final ProfileFormState profileForm;
  final bool isSaving;
  final void Function(ProfileFieldSetter fieldSetter, String value) onFieldChanged;
  final VoidCallback onSave;
  final VoidCallback? onNext;

  const DmcaProfileStep({
    super.key,
    required this.profileForm,
    required this.isSaving,
    required this.onFieldChanged,
    required this.onSave,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("DMCA Profile", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("These details are reused to prefill matching platform form fields.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),
          _buildTextField("Full name", profileForm.fullName, (value) => onFieldChanged((v) => profileForm.fullName = v, value)),
          _buildTextField("Email", profileForm.email, (value) => onFieldChanged((v) => profileForm.email = v, value)),
          _buildTextField("Street address", profileForm.street, (value) => onFieldChanged((v) => profileForm.street = v, value)),
          _buildTextField("Apartment / Suite", profileForm.aptSuite, (value) => onFieldChanged((v) => profileForm.aptSuite = v, value)),
          _buildTextField("City", profileForm.city, (value) => onFieldChanged((v) => profileForm.city = v, value)),
          _buildTextField("Postal code", profileForm.postalCode, (value) => onFieldChanged((v) => profileForm.postalCode = v, value)),
          _buildTextField("Country", profileForm.country, (value) => onFieldChanged((v) => profileForm.country = v, value)),
          _buildTextField("Phone", profileForm.phone, (value) => onFieldChanged((v) => profileForm.phone = v, value)),
          _buildTextField("Signature", profileForm.signature, (value) => onFieldChanged((v) => profileForm.signature = v, value)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: isSaving ? null : onSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black87,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text("Save profile", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onNext,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5E3B7D),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("Next →", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildTextField(String label, String value, ValueChanged<String> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: value,
            style: const TextStyle(color: Colors.black87, fontSize: 14),
            decoration: _buildTextFieldDecoration(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class DmcaPreparationStep extends StatelessWidget {
  final dynamic platform;
  final List<dynamic> allPlatforms;
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formPayload;
  final List<String> detectedUrls;
  final Map<String, dynamic> artworkPrefill;
  final bool isPreparing;
  final Map<String, dynamic>? activeNotice;
  final ValueChanged<String?> onPlatformChanged;
  final void Function(List<dynamic>, dynamic) onUpdatePath;
  final VoidCallback onBack;
  final Future<void> Function() onPrepareNotice;
  final VoidCallback? onNext;

  const DmcaPreparationStep({
    super.key,
    required this.platform,
    required this.allPlatforms,
    required this.formKey,
    required this.formPayload,
    required this.detectedUrls,
    required this.artworkPrefill,
    required this.isPreparing,
    required this.activeNotice,
    required this.onPlatformChanged,
    required this.onUpdatePath,
    required this.onBack,
    required this.onPrepareNotice,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Notice Preparation", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("Choose a platform and fill in the requested fields.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),
          const Text("Target Platform", style: TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
         DropdownButtonFormField<String>(
            initialValue: platform?['slug'] as String?,
            dropdownColor: Colors.white,
            style: const TextStyle(color: Colors.black87, fontSize: 14),
            decoration: InputDecoration(
              filled: true, 
              fillColor: Colors.grey[50], 
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)), 
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2)), 
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)
            ),
            items: allPlatforms
                .map((item) => DropdownMenuItem(value: item['slug'] as String, child: Text(item['displayName'])))
                .toList(),
            onChanged: onPlatformChanged,
          ),
          const SizedBox(height: 24),
          if (platform != null) ...[
            Form(
              key: formKey,
              child: DmcaSchemaForm(
                schema: platform['formSchema'],
                payload: formPayload,
                artworkPrefill: artworkPrefill,
                detectedInfringingUrls: detectedUrls,
                onUpdatePath: onUpdatePath,
              ),
            ),
            const SizedBox(height: 24),
          ],
          if (activeNotice != null)
            Container(
              margin: const EdgeInsets.only(bottom: 24),
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(border: Border(left: BorderSide(color: Colors.green, width: 4))),
              child: Text("Notice Status: ${activeNotice!['status']}", style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          Row(
            children: [
              OutlinedButton(
                onPressed: onBack,
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text("← Back", style: TextStyle(color: Colors.black87)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: isPreparing ? null : onPrepareNotice,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.black87, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: isPreparing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text("Prepare notice", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: onNext,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF5E3B7D), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text("Next →", style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DmcaSubmissionStep extends StatelessWidget {
  final dynamic platform;
  final Map<String, dynamic>? generatedContent;
  final bool isGenerating;
  final Future<void> Function() onGenerateContent;
  final void Function(String, String) onCopyText;
  final VoidCallback onLaunchEmail;
  final VoidCallback onOpenPdf;
  final VoidCallback onBack;

  const DmcaSubmissionStep({
    super.key,
    required this.platform,
    required this.generatedContent,
    required this.isGenerating,
    required this.onGenerateContent,
    required this.onCopyText,
    required this.onLaunchEmail,
    required this.onOpenPdf,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Ready to Send", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("Follow the steps below to submit your notice.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),
          if (platform != null && platform['dmcaUrl'] != null && platform['dmcaUrl'].toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => launchUrl(Uri.parse(platform['dmcaUrl'])),
                  icon: const Icon(Icons.open_in_new, size: 18),
                  label: const Text("Open Platform Web Form"),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                ),
              ),
            ),
          if (generatedContent == null) _buildGenerateContentSection(),
          if (generatedContent != null) DmcaGeneratedContentSection(
            emailData: generatedContent!['email'],
            onCopySubject: () => onCopyText(generatedContent!['email']['subject'], 'Subject copied!'),
            onCopyBody: () => onCopyText(generatedContent!['email']['body'], 'Email body copied!'),
            onLaunchEmail: onLaunchEmail,
            onOpenPdf: onOpenPdf,
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: onBack,
            style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text("← Back", style: TextStyle(color: Colors.black87)),
          ),
        ],
      ),
    );
  }

  Widget _buildGenerateContentSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: Colors.grey[300]!), borderRadius: BorderRadius.circular(8)),
      child: Column(
        children: [
          const Text("Generate the email and PDF attachments before sending."),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isGenerating ? null : onGenerateContent,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF5E3B7D), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: isGenerating ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text("Generate Content"),
            ),
          )
        ],
      ),
    );
  }
}

class DmcaGeneratedContentSection extends StatelessWidget {
  final Map<String, dynamic> emailData;
  final VoidCallback onCopySubject;
  final VoidCallback onCopyBody;
  final VoidCallback onLaunchEmail;
  final VoidCallback onOpenPdf;

  const DmcaGeneratedContentSection({
    super.key,
    required this.emailData,
    required this.onCopySubject,
    required this.onCopyBody,
    required this.onLaunchEmail,
    required this.onOpenPdf,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey[300]!)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("To: ${emailData['to']}", style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text("Subject: ${emailData['subject']}", style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: OutlinedButton.icon(icon: const Icon(Icons.copy, size: 16), label: const Text("Copy Subject"), onPressed: onCopySubject)),
            const SizedBox(width: 12),
            Expanded(child: OutlinedButton.icon(icon: const Icon(Icons.copy, size: 16), label: const Text("Copy Body"), onPressed: onCopyBody)),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, child: OutlinedButton.icon(icon: const Icon(Icons.email_outlined), label: const Text("Open Mail App"), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)), onPressed: onLaunchEmail)),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, child: ElevatedButton.icon(icon: const Icon(Icons.description_outlined), label: const Text("Download PDF"), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF5E3B7D), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)), onPressed: onOpenPdf)),
      ],
    );
  }
}

BoxDecoration _cardDecoration() {
  return BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]);
}

InputDecoration _buildTextFieldDecoration() {
  return InputDecoration(filled: true, fillColor: Colors.grey[50], enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2)), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14));
}
