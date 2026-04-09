import 'package:flutter/material.dart';
import 'dmca_form_utils.dart';

class DmcaSchemaForm extends StatelessWidget {
  final List<dynamic> schema;
  final Map<String, dynamic> payload;
  final List<String> detectedInfringingUrls;
  final Map<String, dynamic> artworkPrefill;
  final Function(List<dynamic> path, dynamic value) onUpdatePath;

  const DmcaSchemaForm({
    Key? key,
    required this.schema,
    required this.payload,
    required this.detectedInfringingUrls,
    required this.artworkPrefill, 
    required this.onUpdatePath,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: schema.map((item) => _renderItem(item, [item['key']])).toList(),
    );
  }

  Widget _renderItem(Map<String, dynamic> item, List<dynamic> path) {
    final kind = item['kind'];
    if (kind == 'field') return _renderField(item, path);
    if (kind == 'group') return _renderGroup(item, path);
    if (kind == 'array') return _renderRepeater(item, path);
    return const SizedBox.shrink();
  }

  InputDecoration _darkInputDecoration(String? hint) {
    return InputDecoration(
      hintText: hint ?? '',
      hintStyle: const TextStyle(color: Color(0xFF737373)), 
      filled: true,
      fillColor: const Color(0xFF262626),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  Widget _renderField(Map<String, dynamic> field, List<dynamic> path) {
    final currentValue = getAtPath(payload, path)?.toString() ?? '';
    final title = field['title'] ?? field['key'];
    final description = field['description'];
    final isRequired = field['required'] == true;

    if (shouldUseDetectedUrlDropdown(field, path, detectedInfringingUrls)) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('$title${isRequired ? ' *' : ''}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
            if (description != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(description, style: const TextStyle(fontSize: 12, color: Color(0xFFA3A3A3)))),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: currentValue.isEmpty ? null : currentValue,
              dropdownColor: const Color(0xFF262626),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: _darkInputDecoration("Select detected URL"),
              items: detectedInfringingUrls.map((url) => DropdownMenuItem(value: url, child: Text(url))).toList(),
              onChanged: (val) => onUpdatePath(path, val),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$title${isRequired ? ' *' : ''}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
          if (description != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(description, style: const TextStyle(fontSize: 12, color: Color(0xFFA3A3A3)))),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: currentValue,
            maxLines: field['type'] == 'textarea' ? 4 : 1,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            keyboardType: field['type'] == 'number' ? TextInputType.number : TextInputType.text,
            decoration: _darkInputDecoration(field['placeholder']),
            onChanged: (val) => onUpdatePath(path, field['type'] == 'number' ? num.tryParse(val) : val),
          ),
        ],
      ),
    );
  }

  Widget _renderGroup(Map<String, dynamic> group, List<dynamic> path) {
    final items = group['items'] as List<dynamic>? ?? [];
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF171717), border: Border.all(color: const Color(0xFF404040)), borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(group['title'] ?? 'Group', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          if (group['description'] != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(group['description'], style: const TextStyle(fontSize: 13, color: Color(0xFFA3A3A3)))),
          const SizedBox(height: 16),
          ...items.map((item) => _renderItem(item, [...path, item['key']])).toList(),
        ],
      ),
    );
  }

  Widget _renderRepeater(Map<String, dynamic> repeater, List<dynamic> path) {
    final rawList = getAtPath(payload, path);
    final rows = rawList is List ? rawList : [];
    final itemSchema = repeater['itemSchema'] as List<dynamic>? ?? [];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF171717), border: Border.all(color: const Color(0xFF404040)), borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(repeater['title'] ?? 'List', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              OutlinedButton.icon(
                icon: const Icon(Icons.add, size: 16, color: Colors.white),
                label: const Text("Add", style: TextStyle(color: Colors.white)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF404040))),
                onPressed: () {
                  final newItem = createDefaultValueForItems(itemSchema, artworkPrefill);
                  onUpdatePath(path, List.from(rows)..add(newItem));
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...rows.asMap().entries.map((entry) {
            final index = entry.key;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: const Color(0xFF262626), borderRadius: BorderRadius.circular(8)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Entry #${index + 1}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.delete_outline, color: Colors.redAccent), onPressed: () => onUpdatePath(path, List.from(rows)..removeAt(index))),
                    ],
                  ),
                  const Divider(color: Color(0xFF404040)),
                  const SizedBox(height: 8),
                  ...itemSchema.map((item) => _renderItem(item, [...path, index, item['key']])).toList(),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}