import json, re, sys

raw = open(sys.argv[1], 'r').read()

# Escape newlines inside JSON string values
result = []
in_string = False
escape_next = False
for ch in raw:
    if escape_next:
        result.append(ch)
        escape_next = False
        continue
    if ch == '\\':
        result.append(ch)
        escape_next = True
        continue
    if ch == '"':
        in_string = not in_string
        result.append(ch)
        continue
    if in_string and ch == '\n':
        result.append('\\n')
        continue
    result.append(ch)

fixed = ''.join(result)
# Remove trailing commas before ] or }
fixed = re.sub(r',\s*([\]\}])', r'\1', fixed)
data = json.loads(fixed)
print(json.dumps(data))
