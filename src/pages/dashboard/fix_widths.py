"""Fix max-w-xs constraints in dashboard widgets - they prevent cards from filling grid cells"""
import os
import re

DASHBOARD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    # Replace max-w-xs with w-full in dashboard widget containers
    content = content.replace('w-full max-w-xs', 'w-full')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        return True
    return False

count = 0
for root, dirs, files in os.walk(DASHBOARD_DIR):
    for fname in files:
        if fname.endswith('.js'):
            fpath = os.path.join(root, fname)
            if fix_file(fpath):
                count += 1
                print(f"  Fixed: {os.path.relpath(fpath, DASHBOARD_DIR)}")

print(f"\nTotal files fixed: {count}")
