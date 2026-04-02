"""Remove max-w-sm/max-w-md from dashboard widget containers"""
import os
import re

DASHBOARD_DIR = os.path.dirname(os.path.abspath(__file__))

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    # Remove max-w-sm and max-w-md from card containers but preserve max-w in truncate contexts
    content = re.sub(r'w-full max-w-sm', 'w-full', content)
    content = re.sub(r'w-full max-w-md', 'w-full', content)
    # Also fix the selfServiceCard pattern
    content = content.replace('max-w-xs mx-auto', 'w-full mx-auto')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        return True
    return False

count = 0
for root, dirs, files in os.walk(DASHBOARD_DIR):
    for fname in files:
        if fname.endswith('.js') and fname != 'fix_all_widths.py' and fname != 'fix_widths.py':
            fpath = os.path.join(root, fname)
            if fix_file(fpath):
                count += 1
                print(f"  Fixed: {os.path.relpath(fpath, DASHBOARD_DIR)}")

print(f"\nTotal files fixed: {count}")
