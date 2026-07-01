import 'package:flutter/material.dart';
import 'dmca_form_utils.dart';

class DmcaSchemaForm extends StatelessWidget {
  final List<dynamic> schema;
  final Map<String, dynamic> payload;
  final List<String> detectedInfringingUrls;
  final Map<String, dynamic> artworkPrefill;
  final Function(List<dynamic> path, dynamic value) onUpdatePath;

  const DmcaSchemaForm({
    super.key,
    required this.schema,
    required this.payload,
    required this.detectedInfringingUrls,
    required this.artworkPrefill,
    required this.onUpdatePath,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: schema
          .map((item) => _renderItem(item, [item['key']]))
          .toList(),
    );
  }

  Widget _renderItem(Map<String, dynamic> item, List<dynamic> path) {
    final kind = item['kind'];
    switch (kind) {
      case 'field':
        return _renderField(item, path);
      case 'group':
        return _renderGroup(item, path);
      case 'array':
        return _renderRepeater(item, path);
      default:
        return const SizedBox.shrink();
    }
  }

  InputDecoration _buildInputDecoration(String? hint) {
    return InputDecoration(
      hintText: hint ?? '',
      hintStyle: TextStyle(color: Colors.grey[500]),
      filled: true,
      fillColor: Colors.grey[50],
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2),
      ),
      errorStyle: const TextStyle(
        color: Colors.redAccent,
        fontSize: 12,
      ),
    );
  }

  Widget _buildLabel(String title, bool isRequired) {
    return Text(
      '$title${isRequired ? ' *' : ''}',
      style: const TextStyle(
        color: Colors.black87,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildDescription(String? description) {
    if (description == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Text(
        description,
        style: TextStyle(
          fontSize: 13,
          color: Colors.grey[600],
        ),
      ),
    );
  }

  Widget _renderField(Map<String, dynamic> field, List<dynamic> path) {
    final currentValue = PathOperations.getAtPath(payload, path)?.toString() ?? '';
    final title = field['title'] ?? field['key'];
    final description = field['description'];
    final isRequired = field['required'] == true;

    if (shouldUseDetectedUrlDropdown(
      field,
      path,
      detectedInfringingUrls,
    )) {
      return _renderUrlDropdown(
        title: title,
        isRequired: isRequired,
        description: description,
        currentValue: currentValue,
        path: path,
      );
    }

    return _renderTextField(
      title: title,
      isRequired: isRequired,
      description: description,
      currentValue: currentValue,
      field: field,
      path: path,
    );
  }

  Widget _renderUrlDropdown({
    required String title,
    required bool isRequired,
    required String? description,
    required String currentValue,
    required List<dynamic> path,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLabel(title, isRequired),
          _buildDescription(description),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            key: ValueKey('${path.join('.')}_dropdown_$currentValue'),
            initialValue: currentValue.isEmpty ? null : currentValue,
            dropdownColor: Colors.white,
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 14,
            ),
            decoration: _buildInputDecoration("Select detected URL"),
            items: detectedInfringingUrls
                .map(
                  (url) => DropdownMenuItem(
                    value: url,
                    child: Text(url),
                  ),
                )
                .toList(),
            onChanged: (val) => onUpdatePath(path, val),
            validator: isRequired
                ? (val) => val == null || val.isEmpty
                    ? 'This field is required'
                    : null
                : null,
          ),
        ],
      ),
    );
  }

  Widget _renderTextField({
    required String title,
    required bool isRequired,
    required String? description,
    required String currentValue,
    required Map<String, dynamic> field,
    required List<dynamic> path,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLabel(title, isRequired),
          _buildDescription(description),
          const SizedBox(height: 8),
          TextFormField(
            key: ValueKey('${path.join('.')}_$currentValue'),
            initialValue: currentValue,
            maxLines: field['type'] == 'textarea' ? 4 : 1,
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 14,
            ),
            keyboardType: field['type'] == 'number'
                ? TextInputType.number
                : TextInputType.text,
            decoration: _buildInputDecoration(field['placeholder']),
            onChanged: (val) => onUpdatePath(
              path,
              field['type'] == 'number' ? num.tryParse(val) : val,
            ),
            validator: isRequired
                ? (val) => val == null || val.trim().isEmpty
                    ? 'This field is required'
                    : null
                : null,
          ),
        ],
      ),
    );
  }

  Widget _renderGroup(Map<String, dynamic> group, List<dynamic> path) {
    final items = group['items'] as List<dynamic>? ?? [];
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            group['title'] ?? 'Group',
            style: const TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          _buildDescription(group['description']),
          const SizedBox(height: 16),
          ...items
              .map((item) =>
                  _renderItem(item, [...path, item['key']]))
              ,
        ],
      ),
    );
  }

  Widget _renderRepeater(
      Map<String, dynamic> repeater, List<dynamic> path) {
    final rawList = PathOperations.getAtPath(payload, path);
    final rows = rawList is List ? rawList : [];
    final itemSchema = repeater['itemSchema'] as List<dynamic>? ?? [];

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildRepeaterHeader(
            title: repeater['title'] ?? 'List',
            onAddPressed: () {
              final newItem =
                  createDefaultValueForItems(itemSchema, artworkPrefill);
              onUpdatePath(path, List.from(rows)..add(newItem));
            },
          ),
          const SizedBox(height: 16),
          ..._buildRepeaterRows(rows, itemSchema, path),
        ],
      ),
    );
  }

  Widget _buildRepeaterHeader({
    required String title,
    required VoidCallback onAddPressed,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
        OutlinedButton.icon(
          icon: const Icon(Icons.add, size: 16, color: Colors.black87),
          label: const Text(
            "Add",
            style: TextStyle(color: Colors.black87),
          ),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: Colors.grey[300]!),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onPressed: onAddPressed,
        ),
      ],
    );
  }

  List<Widget> _buildRepeaterRows(
    List<dynamic> rows,
    List<dynamic> itemSchema,
    List<dynamic> basePath,
  ) {
    return rows.asMap().entries.map((entry) {
      final index = entry.key;
      return _buildRepeaterRow(
        index: index,
        itemSchema: itemSchema,
        basePath: basePath,
        onRemove: () {
          final newRows = List.from(rows)..removeAt(index);
          onUpdatePath(basePath, newRows);
        },
      );
    }).toList();
  }

  Widget _buildRepeaterRow({
    required int index,
    required List<dynamic> itemSchema,
    required List<dynamic> basePath,
    required VoidCallback onRemove,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Entry #${index + 1}",
                style: const TextStyle(
                  color: Colors.black87,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(
                  Icons.delete_outline,
                  color: Colors.redAccent,
                ),
                onPressed: onRemove,
              ),
            ],
          ),
          Divider(color: Colors.grey[200]),
          const SizedBox(height: 12),
          ...itemSchema
              .map(
                (item) => _renderItem(
                  item,
                  [...basePath, index, item['key']],
                ),
              )
              ,
        ],
      ),
    );
  }
}
