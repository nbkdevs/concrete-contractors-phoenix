import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../links.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Future<void> _open(String url) => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Concrete Contractors Estimator', style: text.headlineSmall),
        const SizedBox(height: 8),
        const Text(
          'Work out how much concrete a slab, driveway, patio, footing, column or set of steps needs, '
          'how many 80, 60 or 40 lb bags that is, how much rebar or mesh to buy and a rough installed cost. '
          'The pour day planner turns the forecast high into a start time, hot-weather tips and a cure schedule.',
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('How the numbers work', style: text.titleMedium),
              const SizedBox(height: 6),
              const Text('Volume = length × width × thickness. 27 ft³ = 1 yd³. Bags yield 0.60, 0.45 and 0.30 ft³ (80, 60, 40 lb). '
                  'Rebar is a grid at your spacing with 10 % lap on 20 ft sticks. Ready-mix is ordered in quarter yards. '
                  'Costs are rough planning ranges, not a quote.'),
            ]),
          ),
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Need a crew?', style: text.titleMedium),
              const SizedBox(height: 6),
              const Text('Driveways, patios, stamped concrete, pool decks and repairs, planned around desert heat, monsoon runoff and soil, are handled by $siteName.'),
              TextButton(onPressed: () => _open(siteUrl), child: const Text(siteUrl)),
            ]),
          ),
        ),
        ListTile(leading: const Icon(Icons.privacy_tip_outlined), title: const Text('Privacy'), subtitle: const Text('No account, no tracking, nothing leaves your phone.'), onTap: () => _open(privacyUrl)),
        ListTile(leading: const Icon(Icons.code), title: const Text('Open source (MIT)'), subtitle: const Text(sourceUrl), onTap: () => _open(sourceUrl)),
        const ListTile(leading: Icon(Icons.tag), title: Text('Version 1.0.0')),
      ],
    );
  }
}
