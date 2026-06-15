import os
import re

directories = ['frontend/app', 'frontend/components']

pattern = re.compile(r'\bbg-white(?=[ "''`\n}])')

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = pattern.sub('bg-slc-surface', content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
