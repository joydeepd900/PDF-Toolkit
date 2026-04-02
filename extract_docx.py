import sys
import zipfile
import xml.etree.ElementTree as ET

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text_result = []
            for p in tree.findall('.//w:p', namespaces):
                texts = [node.text for node in p.findall('.//w:t', namespaces) if node.text]
                if texts:
                    text_result.append(''.join(texts))
            return '\n'.join(text_result)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    content = read_docx(sys.argv[1])
    with open('spec_utf8.txt', 'w', encoding='utf-8') as f:
        f.write(content)
