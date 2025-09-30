# Changelog

## [1.0.5] - 2025-09-24

### Improved
- Hook for damage dealing
- Effect processing inputs

### Removed
- Default durations

## [1.0.4] - 2025-09-24

### Added
- Weapon command support
- Effect command creation by uuid and base64 for guided effects

### Improved
- Default effect duration to end of scene, excluding resources and conditions
- Parser duration events
- Chat card creation time increased so they are added after the item name

## [1.0.3] - 2025-09-20

### Added
- Spell and skill support
- HTML parsing safety

### Improved
- Socket management 
- Amount parsing by using the system expressions
- Object types
- Code structure
- Linting

### Fixed
- Bug in resource pipelines
- Parsing of resource event args containing parenthesis; for step expressions
- Proper cleanup of hooks on module disable

## [1.0.1] - 2025-09-17

+ initial release 
