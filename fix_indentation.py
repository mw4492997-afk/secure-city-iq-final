with open('Securecity_IQ.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_secure_class = False

for line in lines:
    if line.strip().startswith('class SecureCityIQ'):
        in_secure_class = True
        new_lines.append(line)
    elif line.strip().startswith('def classify_threat') or line.strip().startswith('if __name__ == "__main__":'):
        in_secure_class = False
        new_lines.append(line)
    else:
        if in_secure_class:
            new_lines.append('    ' + line)
        else:
            new_lines.append(line)

with open('Securecity_IQ_fixed.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Indentation fixed and saved to Securecity_IQ_fixed.py")
