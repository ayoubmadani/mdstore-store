import re, os

ar_dir = '/home/ayoub/Desktop/md/store/src/theme/fr'
remaining = set()

for theme in os.listdir(ar_dir):
    fpath = os.path.join(ar_dir, theme, 'main.tsx')
    if not os.path.exists(fpath):
        continue
    with open(fpath) as f:
        content = f.read()
    # strings in single or double quotes
    for m in re.findall(r'"([^"]{2,100})"', content):
        if re.search(r'[؀-ۿ]{3,}', m):
            remaining.add(m.strip())
    for m in re.findall(r"'([^']{2,100})'", content):
        if re.search(r'[؀-ۿ]{3,}', m):
            remaining.add(m.strip())
    # JSX text nodes
    for m in re.findall(r'>([^<>{}]{2,100})<', content):
        if re.search(r'[؀-ۿ]{3,}', m):
            remaining.add(m.strip())

for r in sorted(remaining):
    print(repr(r))
