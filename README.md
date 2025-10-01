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

This module parses the same description inline effects Fabula Ultima already supports (e.g. @GAIN[], @LOSS[], @EFFECT[]) and applies them automatically when the item is used. The owner, and the targets are considered.

If the description mentions "you", ":" and other texts in-between: the effects in that line will be applied to the owner
```
You suffer: @LOSS[10 mp]
you receive: @EFFECT[shaken]
you: @TYPE[damage all light e:sot i:1 t:source]
```

Targets follow the same rules, but with the word "target" instead of "you". 
```
targets heal: @GAIN[60 hp]
targets: @EFFECT[slow]@EFFECT[weak] 
```

### Effect choices
Some items allow users to choose from multiple effects. In those cases, wrap the options in parentheses.  
Any readability text outside the inline tags is ignored, as long as the choices are inside the parentheses.

In this case, both items will be parsed identically
```
Target Suffers: (@EFFECT[dazed], @EFFECT[weak], or @LOSS[$sl*10 mp]{SL × 10 MP})
targets: (@EFFECT[dazed]@EFFECT[weak]@LOSS[$sl*10 mp])
```

### Demo
https://github.com/user-attachments/assets/614f5b60-9cf2-4b00-8547-9773279f3724

https://github.com/user-attachments/assets/71d4dd6c-bfc5-4d0f-bca9-85df41b3e89e

#### Note
This module does not handle spell MP consuption.  
You could achieve a similar effect, but multi-target spell consumption is not calculated:
```
Item name: Shaker spell

Description:
Flavor text
---
you pay: @LOSS[10 mp] 
targets suffer: @EFFECT[shaken]
```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the GPL-3.0-only License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.