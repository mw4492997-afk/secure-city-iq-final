import ast
import re

def fix_indentation(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Remove empty lines at the beginning
    while lines and lines[0].strip() == '':
        lines.pop(0)

    # Fix indentation by parsing the structure
    fixed_lines = []
    indent_level = 0
    in_class = False
    in_function = False
    in_if = False
    in_for = False
    in_while = False
    in_try = False
    in_with = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            fixed_lines.append('\n')
            continue

        # Check for class definition
        if stripped.startswith('class '):
            indent_level = 0
            in_class = True
            fixed_lines.append(stripped + '\n')
            indent_level = 1
            continue

        # Check for function definition
        if stripped.startswith('def ') or stripped.startswith('async def '):
            if in_class:
                indent_level = 1
            else:
                indent_level = 0
            in_function = True
            fixed_lines.append('    ' * indent_level + stripped + '\n')
            indent_level += 1
            continue

        # Check for control structures
        if stripped.startswith(('if ', 'elif ', 'else:', 'for ', 'while ', 'try:', 'except ', 'finally:', 'with ', 'return ', 'break', 'continue', 'pass')):
            if in_class and not in_function:
                indent_level = 1
            elif in_function:
                indent_level = 2
            else:
                indent_level = 0
            fixed_lines.append('    ' * indent_level + stripped + '\n')
            if stripped.endswith(':'):
                indent_level += 1
            continue

        # Regular lines
        if in_class and not in_function:
            indent_level = 1
        elif in_function:
            indent_level = 2
        else:
            indent_level = 0

        fixed_lines.append('    ' * indent_level + stripped + '\n')

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)

if __name__ == '__main__':
    fix_indentation('Securecity_IQ.py')
    print("Indentation fixed")
