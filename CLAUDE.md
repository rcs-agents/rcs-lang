# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for RCL (Rich Communication Language) - a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides a complete language toolchain including parser, CLI compiler, language service, and VSCode extension.

## Architecture

### Monorepo Structure
- **packages/parser** - ANTLR4-based grammar and parser for RCL (PRIMARY PARSER)
- **packages/parser** - Legacy Tree-sitter parser (DEPRECATED - DO NOT USE)
- **packages/compiler** - Modern compilation pipeline using ANTLR AST
- **packages/cli** - Command-line compiler for RCL files
- **packages/language-service** - Advanced language service providers
- **apps/extension** - VSCode extension with full language support
- **apps/ide** - Web-based RCS Agent Studio for non-technical users

### Build System
- **Moon** - Task orchestration across the monorepo
- **Node** AND **Web** - Runtime
- **ANTLR4** - Parser generator for the RCL grammar (replaced Tree-sitter)

## Essential Commands

[... existing content remains the same ...]

## Development Workflow

[... existing content remains the same ...]

## Important Files

[... existing content remains the same ...]

## Recent Learnings & Critical Knowledge

### Package Management Guidelines
- NEVER USE NPM. WE HATE NPM

[... rest of the existing content remains the same ...]