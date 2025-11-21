## Problem statement
Often it is a lot more feasible to get some parts from different pdfs and create your own according to your own understanding. Sometimes we also need to Password-protect it.
That is very common in education and office/proffessional purposes.
However, we generally don't find free tools for the same in the Apps we use.
This PDF-Toolkit provides us with the features to do it.

## Scope of the Project
### Functional Scope
* File Management: Capable of merging multiple PDF documents into a single cohesive file and splitting large documents into individual pages.
* Content Extraction: Allows users to extract specific page ranges (e.g., extracting chapters from a textbook) without losing quality.
* Security: Password-protect sensitive documents.
* User Interface: Provides a Graphical User Interface (GUI) for file selection, eliminating the need for users to type complex file paths.
* Portability: Deployed as a standalone .exe executable, requiring no Python installation or external dependencies on the client machine.

### Future Scope
* Optical Character Recognition (OCR): Integrating Tesseract to convert scanned PDFs (images) into searchable, selectable text.
* Web Integration: Migrating the tool from a desktop script to a Web Application using Flask or Streamlit, allowing users to edit PDFs directly in their browser.
* Cloud Storage: Adding APIs for Google Drive or Dropbox to automatically fetch and save documents to the cloud.
* Batch Processing: Automating the tool to watch a specific folder (e.g., "Downloads") and automatically organize/encrypt any PDF that lands there.
* Metadata Editor: Allowing users to strip sensitive metadata (author name, creation date) for privacy.

## Target Users
* Students: For combining lecture notes or extracting specific homework pages
* Teachers
* Prffessional: For organizing reports
* Archivists: For splitting and sorting large scanned bundles of documents

## High-Level Features
Implements AES-128 encryption for creating a locked PDF
