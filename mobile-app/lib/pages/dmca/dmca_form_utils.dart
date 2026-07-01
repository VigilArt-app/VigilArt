import 'dart:convert';

class ProfileFormState {
  String fullName = "";
  String street = "";
  String aptSuite = "";
  String city = "";
  String postalCode = "";
  String country = "";
  String email = "";
  String phone = "";
  String signature = "";

  Map<String, dynamic> toJson() => {
    "fullName": fullName,
    "street": street,
    "aptSuite": aptSuite,
    "city": city,
    "postalCode": postalCode,
    "country": country,
    "email": email,
    "phone": phone,
    "signature": signature,
  };

  void fromJson(Map<String, dynamic> data) {
    fullName = data['fullName'] ?? "";
    email = data['email'] ?? "";
    street = data['street'] ?? "";
    aptSuite = data['aptSuite'] ?? "";
    city = data['city'] ?? "";
    postalCode = data['postalCode'] ?? "";
    country = data['country'] ?? "";
    phone = data['phone'] ?? "";
    signature = data['signature'] ?? "";
  }

  bool get isEmpty =>
      fullName.isEmpty &&
      street.isEmpty &&
      aptSuite.isEmpty &&
      city.isEmpty &&
      postalCode.isEmpty &&
      country.isEmpty &&
      email.isEmpty &&
      phone.isEmpty &&
      signature.isEmpty;
}

const Map<String, String> profileKeyMap = {
  "full_name": "fullName",
  "street": "street",
  "apt": "aptSuite",
  "city": "city",
  "postal_code": "postalCode",
  "country": "country",
  "email": "email",
  "phone_number": "phone",
  "signature": "signature",
};

class InfringingRepeaterDescriptor {
  final List<dynamic> path;
  final List<dynamic> itemSchema;
  final int minItems;

  InfringingRepeaterDescriptor({
    required this.path,
    required this.itemSchema,
    required this.minItems,
  });
}

class PathOperations {
  static dynamic getAtPath(dynamic source, List<dynamic> path) {
    dynamic current = source;
    for (var part in path) {
      if (current == null) return null;
      if (part is int && current is List) {
        if (part < 0 || part >= current.length) return null;
        current = current[part];
      } else if (part is String && current is Map) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }

  static dynamic setAtPath(
      dynamic source, List<dynamic> path, dynamic value) {
    if (path.isEmpty) return value;

    var head = path.first;
    var rest = path.sublist(1);

    if (head is int) {
      List<dynamic> current = source is List ? List<dynamic>.from(source) : [];
      while (current.length <= head) {
        current.add(null);
      }
      current[head] = setAtPath(current[head] ?? {}, rest, value);
      return current;
    } else {
      Map<String, dynamic> current = source is Map ? Map<String, dynamic>.from(source) : {};
      current[head as String] = setAtPath(current[head] ?? {}, rest, value);
      return current;
    }
  }

  static dynamic deepClone(dynamic object) {
    return jsonDecode(jsonEncode(object));
  }
}

bool shouldUseDetectedUrlDropdown(
  Map<String, dynamic> field,
  List<dynamic> path,
  List<String> detectedUrls,
) {
  if (detectedUrls.isEmpty) return false;

  final key = (field['key'] as String? ?? '').toLowerCase();
  final title = (field['title'] as String? ?? '').toLowerCase();
  final pathText = path.join('.').toLowerCase();

  if (key.contains('original') || pathText.contains('original_work')) {
    return false;
  }

  if (key == 'infringing_url') return true;

  if (field['type'] != 'url') return false;

  return key == 'link' ||
      key == 'url' ||
      key.contains('infring') ||
      key.contains('report') ||
      title.contains('link') ||
      title.contains('url');
}

dynamic hydrateProfileInPayload(
    dynamic source, ProfileFormState profile) {
  if (source is List) {
    return source
        .map((entry) => hydrateProfileInPayload(entry, profile))
        .toList();
  }
  if (source is! Map) return source;

  Map<String, dynamic> result = {};
  final profileJson = profile.toJson();

  source.forEach((key, value) {
    final mappedProfileKey = profileKeyMap[key];
    if (mappedProfileKey != null && (value == "" || value == null)) {
      result[key] = profileJson[mappedProfileKey] ?? "";
    } else {
      result[key] = hydrateProfileInPayload(value, profile);
    }
  });

  return result;
}

dynamic createDefaultValueForItem(
  Map<String, dynamic> item,
  Map<String, dynamic> prefill,
) {
  final kind = item['kind'];
  final key = item['key'];

  switch (kind) {
    case 'field':
      return _createDefaultFieldValue(key, prefill);
    case 'group':
      return createDefaultValueForItems(item['items'] ?? [], prefill);
    case 'array':
      final minItems = item['minItems'] ?? 0;
      return List.generate(
        minItems,
        (_) => createDefaultValueForItems(item['itemSchema'] ?? [], prefill),
      );
    default:
      return null;
  }
}

String _createDefaultFieldValue(String key, Map<String, dynamic> prefill) {
  switch (key) {
    case 'original_work_description':
      return prefill['artworkTitle'] ??
          prefill['artworkDescription'] ??
          '';
    case 'original_work_url':
      return prefill['originalWorkUrl'] ?? '';
    default:
      return '';
  }
}

Map<String, dynamic> createDefaultValueForItems(
  List<dynamic> items,
  Map<String, dynamic> prefill,
) {
  final result = <String, dynamic>{};
  for (var item in items) {
    result[item['key']] = createDefaultValueForItem(item, prefill);
  }
  return result;
}

List<InfringingRepeaterDescriptor> findInfringingRepeaters(
  List<dynamic> items, [
  List<dynamic> basePath = const [],
]) {
  final found = <InfringingRepeaterDescriptor>[];

  for (var item in items) {
    final currentPath = List<dynamic>.from(basePath)..add(item['key']);

    if (item['kind'] == 'group') {
      found.addAll(
        findInfringingRepeaters(item['items'] ?? [], currentPath),
      );
      continue;
    }

    if (item['kind'] == 'array') {
      final itemSchema = (item['itemSchema'] as List<dynamic>?) ?? [];
      final hasInfringingUrlField =
          _hasInfringingUrlField(itemSchema);

      if (hasInfringingUrlField) {
        found.add(
          InfringingRepeaterDescriptor(
            path: currentPath,
            itemSchema: itemSchema,
            minItems: item['minItems'] ?? 0,
          ),
        );
      }

      found.addAll(findInfringingRepeaters(itemSchema, currentPath));
    }
  }

  return found;
}

bool _hasInfringingUrlField(List<dynamic> itemSchema) {
  return itemSchema.any(
    (schemaItem) =>
        schemaItem['kind'] == 'field' &&
        schemaItem['key'] == 'infringing_url',
  );
}

dynamic clearPreselectedInfringingUrls(
  dynamic payload,
  List<InfringingRepeaterDescriptor> repeaters,
) {
  dynamic nextPayload = PathOperations.deepClone(payload);

  for (var repeater in repeaters) {
    final resetRows = List.generate(
      repeater.minItems,
      (_) => createDefaultValueForItems(repeater.itemSchema, {}),
    );
    nextPayload =
        PathOperations.setAtPath(nextPayload, repeater.path, resetRows);
  }

  return nextPayload;
}
