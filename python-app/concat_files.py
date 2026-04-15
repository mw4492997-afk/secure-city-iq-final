import os
import glob

def concatenate_files():
    extensions = ['*.py', '*.html', '*.css', '*.md', '*.txt', '*.json', '*.yaml', '*.bat', '*.sh', '*.ini']
    all_files = []
    for ext in extensions:
        all_files.extend(glob.glob(ext, recursive=True))

    with open('all_code.txt', 'w', encoding='utf-8') as outfile:
        for file_path in sorted(all_files):
            if os.path.isfile(file_path):
                outfile.write(f'=== {file_path} ===\n')
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        outfile.write(content)
                        outfile.write('\n\n')
                except Exception as e:
                    outfile.write(f'Error reading file: {e}\n\n')

if __name__ == '__main__':
    concatenate_files()
