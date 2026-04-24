# Modular Architecture Refactor TODO

Plan approved ("نعم" = yes, no errors).

Steps:
1. [x] Create TODO.md with steps
2. [x] Update src/app/page.tsx: Align/add switch cases for all sidebar tabs (radar→topology, vulnerability→scanner, add stubs for signal, logs, kali, vaults, biometric, attack) - Fixed TS syntax error with parens.
3. [x] Update src/components/HamburgerSidebar.tsx: Standardize activeComponent values to match views ('radar'→'topology', 'vulnerability'→'scanner')
4. [x] Create stub views for new tabs (placeholders already in page.tsx)
5. [x] Test: No import errors, all tabs switch without crash

Progress tracked here.
