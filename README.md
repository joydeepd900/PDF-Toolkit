# PDF Toolkit v2.1

A lightweight, secure, and offline Python utility to manage and convert PDF files efficiently.

Unlike online tools that require uploading sensitive documents to unknown servers, PDF Toolkit runs entirely on your local machine, ensuring 100% data privacy.

## 🚀 Key Features

### PDF Management
* **Universal Merge:** Combine multiple **PDFs and Images** (JPG/PNG) from a folder into a single PDF document.
* **Split:** Instantly separate every page of a document into its own PDF file.
* **Extract Pages:** Create a new PDF containing only specific page ranges (e.g., pages 3-5).
* **Encryption:** Secure your documents with AES-128 password protection.

### Conversion & Privacy (New in v2.0)
* **Image to PDF:** Convert collections of Images (JPG/PNG) into a single PDF file.
* **PDF to Text:** Extract raw text from PDF files into a `.txt` file for easy editing.
* **Privacy Mode:** Strip hidden metadata (Author, Creator, Date) to anonymize your files before sharing.

## 🛠️ Built With
* **Python 3.13.7:** Core logic.
* **pypdf:** For binary PDF manipulation (reading/writing streams).
* **Pillow (PIL):** For image processing and conversion.
* **Tkinter:** For native Windows file/folder selection dialogs.
* **OS Module:** For file system navigation.

## 📥 Download & Installation (Windows)
No Python installation is required to use the tool.

1.  Go to the [Releases Page](https://github.com/joydeepd900/PDF-Toolkit/releases/latest).
2.  Download the latest `.exe` file (e.g., `PDF.TOOLKIT.v2.1.exe`).
3.  Double-click to run.

## 📖 How to Use
On starting the application, you will see the interactive Command Line Interface (CLI):

1.  **Select an Option:** Type the number corresponding to your desired task (0-7).
2.  **Select Files:** A Windows pop-up dialog will appear to let you choose your files/folders.
3.  **Process:** The tool will process your file and save the output in the **same folder** as the original.

> **Need a Visual Guide?**
> Check out the [Visual User Manual](https://github.com/joydeepd900/PDF-Toolkit/blob/main/PDF%20Toolkit%20v1%20Manual.pdf) for step-by-step screenshots. Please note: the manual is yet to be updated and existing manual is for v1.0

## 💻 For Developers (Running from Source)
If you want to modify or run the raw script, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/joydeepd900/PDF-Toolkit.git](https://github.com/joydeepd900/PDF-Toolkit.git)
    ```
2.  **Install Dependencies:**
    ```bash
    pip install pypdf Pillow
    ```
3.  **Run the script:**
    ```bash
    python "PDF TOOLKIT v2.1.py"
    ```

## ⚠️ Known Limitations
* **Merging:** The tool automatically detects PDFs, JPGs, and PNGs. Any other file types in the folder will be skipped.
* **Large Files:** Splitting very large PDFs (1000+ pages) may consume significant storage as it creates a file for every page. Use the **Extract** feature for targeted splitting.
* **Input Validation:** Ensure you enter valid page ranges (Start Page < End Page).

---
*Created by [Joydeepd900](https://github.com/joydeepd900)*
