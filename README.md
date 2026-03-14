# PDF Toolkit v2.5 📄

A lightweight, secure, and cross-platform Python utility to manage and convert PDF files efficiently. 

Unlike online tools that require uploading sensitive documents to unknown servers, PDF Toolkit runs entirely on your local machine, ensuring 100% data privacy. Now running natively on both **Windows and Linux**!

## 🚀 Key Features

### PDF Management
* **Universal Merge:** Combine multiple **PDFs and Images** (JPG/PNG) from a folder into a single PDF document.
* **Split:** Instantly separate every page of a document into its own PDF file.
* **Extract Pages:** Create a new PDF containing only specific page ranges (e.g., pages 3-5).
* **Encryption:** Secure your documents with AES-128 password protection, now featuring **double-entry hidden keystrokes** to prevent typos and shoulder-surfing.

### Conversion & Privacy
* **PDF to Image (New):** Render entire PDF pages into high-quality PNG images (Perfect for sharing documents as pictures).
* **Extract Images (New):** Rip original, embedded photos (JPG/PNG) directly out of a PDF while leaving the text behind.
* **Image to PDF:** Convert collections of Images into a single PDF file.
* **PDF to Text:** Extract raw text from PDF files into a `.txt` file for easy editing.
* **Privacy Mode:** Strip hidden metadata (Author, Creator, Date) to anonymize your files before sharing.
* **Smart Naming:** Press 'Enter' when asked for a filename to use automatic default names.

## 🛠️ Built With
* **Python 3.x:** Core logic.
* **pypdf:** For binary PDF manipulation (reading/writing streams).
* **PyMuPDF (fitz):** For high-fidelity page rendering and image extraction.
* **Pillow (PIL):** For image processing and conversion.
* **Tkinter:** For native OS file/folder selection dialogs.
* **OS Module:** For file system navigation.

## 📥 Download & Installation
No Python installation is required to use the pre-compiled tools. Go to the [Releases Page](https://github.com/joydeepd900/PDF-Toolkit/releases/latest) to download the latest version.

### 🪟 For Windows
1. Download the latest `.exe` file (e.g., `PDF.TOOLKIT.v2.5.exe`).
2. Double-click to run.

### 🐧 For Linux (Ubuntu/Debian)
1. Ensure your system has the base UI library installed by running: 
   `sudo apt-get install python3-tk`
2. Download the `PDF TOOLKIT v2.5` executable (no file extension).
3. Open your terminal in the download folder and grant execution rights:
   `chmod +x "PDF TOOLKIT v2.5"`
4. Run the app: 
   `./"PDF TOOLKIT v2.5"`

## 📖 How to Use
On starting the application, you will see the interactive Command Line Interface (CLI):

1.  **Select an Option:** Type the number corresponding to your desired task (0-9).
2.  **Select Files:** A native pop-up dialog will appear to let you choose your files/folders.
3.  **Process:** The tool will process your file and save the output in the **same folder** as the original.

> **Need a Visual Guide?**
> Check out the [Visual User Manual](https://github.com/joydeepd900/PDF-Toolkit/blob/main/PDF%20Toolkit%20v1%20Manual.pdf) for step-by-step screenshots. *(Note: The manual is from v1.0, but the core workflow remains similar.)*

## 💻 For Developers (Running from Source)
If you want to modify or run the raw script, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/joydeepd900/PDF-Toolkit.git](https://github.com/joydeepd900/PDF-Toolkit.git)
    ```
2.  **Create a Virtual Environment & Install Dependencies:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install pypdf Pillow pymupdf
    ```
    *(Linux users: Ensure you have `python3-tk` and `python3-venv` installed via `apt` first).*
3.  **Run the script:**
    ```bash
    python "PDF TOOLKIT v2.5.py"
    ```

## ⚠️ Known Limitations
* **Merging:** The tool automatically detects PDFs, JPGs, and PNGs. Any other file types in the folder will be safely skipped.
* **Large Files:** Splitting very large PDFs (1000+ pages) may consume significant storage as it creates a file for every page. Use the **Extract** feature for targeted splitting.
* **Input Validation:** Ensure you enter valid page ranges (Start Page < End Page).

---
*Created by [Joydeepd900](https://github.com/joydeepd900)*
