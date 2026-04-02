import requests

url = "http://localhost:8000/api/lock"
files = {'file': ('Blender Shortcuts.pdf', open('Blender Shortcuts.pdf', 'rb'), 'application/pdf')}
data = {'password': '1234'}

resp = requests.post(url, files=files, data=data)
print("STATUS:", resp.status_code)
print("HEADERS:", resp.headers)
print("CONTENT-TYPE:", resp.headers.get('content-type'))
print("CONTENT-DISPOSITION:", resp.headers.get('content-disposition'))
print("LEN:", len(resp.content))
if len(resp.content) < 1000:
    print("BODY:", resp.text)
