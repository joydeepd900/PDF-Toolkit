# PDF-Toolkit

A lightweight utility Python tool to manage PDF files efficiently.

## Features
* Merger: Combine multiple PDFs into one.
* Splitter: Separate every page into its own file.
* Extracter: Pull specific page ranges (e.g., pages 3-5).
* Encrypter: Password protect your documents.

## Tools Used
* Python to code
* os module to connect with the system
* tkinter module for the selection window GUI
* pypdf library to manage the pdfs
* pyintaller to convert the .py file to .exe file

## To Download the Application
Go to the [Releases Page] to download the Windows App (.exe).
https://github.com/joydeepd900/PDF-Toolkit/releases/tag/v1.0

## How to Use
Refer to the Manual with Screenshots attached in this repository.
Files (pdfs) will be save in the same folder selected for application.

## To Run the Source Code
1. Install pypdf library. Run 'pip install pypdf' in Command Prompt 
2. Then run the script: 'python "PDF TOOLKIT.py"'

## Testing
* This is a basic python tool that can be used for pdf managing, but won't execute messy commands and may report error or terminate the momment. This may also be prone to many other unknown errors. But as a beginner in python, that's all I could create, and I hope to modify it more in future.
* For folder/file selection, not selecting a folder/file will terminate the program.
* For Merger, select a folder containg only the PDFs you want to merge. It will merge all the files in folder.
* For Splitter, avoid splitting large pdfs as they will occupy your storage. Use Extracter instead.
* For Extracter, do not enter wrong range of pages as it may report error or terminate the program.
* For Encrypter, it creates a new locked file and does not modify the existing.
