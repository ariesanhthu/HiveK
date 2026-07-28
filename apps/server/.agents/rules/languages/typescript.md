---
description: TypeScript specific constraints and standards
---

# TypeScript Rules

- TypeScript 5.9+ with `target: ES2024` in `tsconfig.json`.
- Uses ES module resolution with `module: "nodenext"` and `moduleResolution: "nodenext"`.
- Uses decorators with `emitDecoratorMetadata: true` and `experimentalDecorators: true`.
- Prefer `interface` for contracts/props, `type` for unions/aliases.
- Use ES modules `import/export`.
- Use Symbol constants for Dependency Injection tokens.
- Use path aliases: `@/*`, `@core/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@shared/*`.
- Use `@nestjs/mongoose` with `@Prop()` and `@Schema()` decorators for schema definitions.
