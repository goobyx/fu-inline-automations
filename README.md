# FU Inline Automations

This module parses and executes inline commands in item descriptions, saving time players can spend elsewhere. Made specifically for [project fabula ultima](https://github.com/League-of-Fabulous-Developers/FoundryVTT-Fabula-Ultima)

## Requirements

- **FoundryVTT**: Version 13+
- **System**: Fabula Ultima (projectfu) 4.1.4
- **Dependencies**: 
  - [Socket.lib](https://github.com/farling42/foundryvtt-socketlib) 

## Installation

1. Open FoundryVTT and go to the "Add-on Modules" tab
2. Click "Install Module"
3. Paste this manifest URL: `https://github.com/goobyx/fu-inline-automations/releases/latest/download/module.json`
4. Click "Install"

## Usage

Once installed and enabled, the module automatically processes the inline commands in item descriptions that the system already handles. Some examples:
- @GAIN[10 hp]
- @EFFECT[slow]
- @LOSS[5 mp] 

The module searches for two different lines. 
- A line that includes "you" and ":"
  - you gain:
  - you recover: 
  - you obtain: 
- Same as above, but with the word "targets"

The commands are mandatory, with the option to choose among effects enclosed in parenthesis

Some examples then would be
- you get: @LOSS[5 mp]
- targets take: @EFFECT[slow] (@EFFECT[dazed] @LOSS[10 mp])

## Development

This module is built with TypeScript and uses Vite for building.

### Setup
```bash
npm install
```

### Building
```bash
npm run build
```

### Development (with watch)
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the GPL-3.0-only License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/goobyx/fu-inline-automations/issues)
- **Discussions**: [GitHub Discussions](https://github.com/goobyx/fu-inline-automations/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.
